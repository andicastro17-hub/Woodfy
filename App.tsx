
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  TrendingUp, 
  Calculator, 
  Menu, 
  X, 
  Users, 
  Truck, 
  Repeat,
  DollarSign,
  ClipboardList,
  RefreshCw,
  Calendar,
  PieChart
} from 'lucide-react';
import { 
  Project, Cost, Revenue, Customer, Supplier, GeneralExpense, Budget, PaymentStatus
} from './types';
import { 
  INITIAL_PROJECTS, INITIAL_COSTS, INITIAL_REVENUES, 
  INITIAL_CUSTOMERS, INITIAL_SUPPLIERS, INITIAL_EXPENSES, INITIAL_BUDGETS
} from './constants';

import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import Simulator from './components/Simulator';
import Customers from './components/Customers';
import Suppliers from './components/Suppliers';
import CashFlow from './components/CashFlow';
import AccountsPayableReceivable from './components/AccountsPayableReceivable';
import CalendarComponent from './components/Calendar';
import Reports from './components/Reports';

type Tab = 'dashboard' | 'projects' | 'simulator' | 'customers' | 'suppliers' | 'cashflow' | 'payableReceivable' | 'calendar' | 'reports';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const mainContentRef = useRef<HTMLElement>(null);

  const [projects, setProjects] = useState<Project[]>(() => JSON.parse(localStorage.getItem('mp_projects') || JSON.stringify(INITIAL_PROJECTS)));
  const [costs, setCosts] = useState<Cost[]>(() => JSON.parse(localStorage.getItem('mp_costs') || JSON.stringify(INITIAL_COSTS)));
  const [revenues, setRevenues] = useState<Revenue[]>(() => JSON.parse(localStorage.getItem('mp_revenues') || JSON.stringify(INITIAL_REVENUES)));
  const [customers, setCustomers] = useState<Customer[]>(() => JSON.parse(localStorage.getItem('mp_customers') || JSON.stringify(INITIAL_CUSTOMERS)));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => JSON.parse(localStorage.getItem('mp_suppliers') || JSON.stringify(INITIAL_SUPPLIERS)));
  const [expenses, setExpenses] = useState<GeneralExpense[]>(() => JSON.parse(localStorage.getItem('mp_expenses') || JSON.stringify(INITIAL_EXPENSES)));
  const [budgets, setBudgets] = useState<Budget[]>(() => JSON.parse(localStorage.getItem('mp_budgets') || JSON.stringify(INITIAL_BUDGETS)));
  const [calendarNotes, setCalendarNotes] = useState<Record<string, string>>(() => JSON.parse(localStorage.getItem('mp_calendar_notes') || '{}'));

  useEffect(() => {
    localStorage.setItem('mp_projects', JSON.stringify(projects));
    localStorage.setItem('mp_costs', JSON.stringify(costs));
    localStorage.setItem('mp_revenues', JSON.stringify(revenues));
    localStorage.setItem('mp_customers', JSON.stringify(customers));
    localStorage.setItem('mp_suppliers', JSON.stringify(suppliers));
    localStorage.setItem('mp_expenses', JSON.stringify(expenses));
    localStorage.setItem('mp_budgets', JSON.stringify(budgets));
    localStorage.setItem('mp_calendar_notes', JSON.stringify(calendarNotes));
  }, [projects, costs, revenues, customers, suppliers, expenses, budgets, calendarNotes]);

  // Effect to automatically calculate realCost for projects when costs change
  useEffect(() => {
    setProjects(currentProjects => {
        let hasChanged = false;
        const newProjects = currentProjects.map(p => {
            const associatedCosts = costs.filter(c => c.projectId === p.id);
            const newRealCost = associatedCosts.reduce((sum, cost) => sum + cost.value, 0);
            if (p.realCost !== newRealCost) {
                hasChanged = true;
                return { ...p, realCost: newRealCost };
            }
            return p;
        });
        return hasChanged ? newProjects : currentProjects;
    });
  }, [costs]);

  // Effect to update customer stats (totalSpent, lastOrder) when projects/revenues change
  useEffect(() => {
    setCustomers(currentCustomers => {
        let hasChanged = false;
        const newCustomers = currentCustomers.map(c => {
            const customerProjects = projects.filter(p => p.clientId === c.id && p.paymentStatus === PaymentStatus.PAID);
            
            const newTotalSpent = customerProjects.reduce((sum, p) => sum + p.valueSold, 0);

            const associatedRevenues = revenues.filter(r => 
                customerProjects.some(p => p.id === r.projectId) && r.status === PaymentStatus.PAID
            );
            
            let newLastOrder = c.lastOrder;
            if (associatedRevenues.length > 0) {
                newLastOrder = associatedRevenues.reduce((latestDate, current) => 
                    new Date(current.date) > new Date(latestDate) ? current.date : latestDate, 
                    c.lastOrder // Initialize with current last order to handle empty arrays
                );
            }

            if (c.totalSpent !== newTotalSpent || c.lastOrder !== newLastOrder) {
                hasChanged = true;
                return { ...c, totalSpent: newTotalSpent, lastOrder: newLastOrder };
            }
            return c;
        });
        return hasChanged ? newCustomers : currentCustomers;
    });
  }, [projects, revenues]);

  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setRevenues(prev => prev.filter(r => r.projectId !== projectId));
    setCosts(prev => prev.filter(c => c.projectId !== projectId));
  };

  const navItems = [
    { id: 'dashboard', label: 'Resumo Geral', icon: LayoutDashboard },
    { id: 'customers', label: 'Seus Clientes', icon: Users },
    { id: 'simulator', label: 'Orçamentos', icon: Calculator },
    { id: 'projects', label: 'Projetos e Vendas', icon: Briefcase },
    { id: 'cashflow', label: 'Fluxo de Caixa', icon: Repeat },
    { id: 'payableReceivable', label: 'Contas a Pagar e Receber', icon: ClipboardList },
    { id: 'suppliers', label: 'Fornecedores', icon: Truck },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
    { id: 'reports', label: 'Relatórios', icon: PieChart },
  ];

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    mainContentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard projects={projects} costs={costs} revenues={revenues} expenses={expenses} />;
      case 'projects': return <Projects projects={projects} setProjects={setProjects} customers={customers} budgets={budgets} costs={costs} handleDeleteProject={handleDeleteProject} />;
      case 'simulator': return <Simulator customers={customers} budgets={budgets} setBudgets={setBudgets} />;
      case 'customers': return <Customers customers={customers} setCustomers={setCustomers} />;
      case 'suppliers': return <Suppliers suppliers={suppliers} setSuppliers={setSuppliers} />;
      case 'cashflow': return <CashFlow 
                                revenues={revenues} setRevenues={setRevenues}
                                expenses={expenses} setExpenses={setExpenses}
                                costs={costs} setCosts={setCosts}
                                projects={projects}
                                suppliers={suppliers}
                                customers={customers}
                              />;
      case 'payableReceivable': return <AccountsPayableReceivable revenues={revenues} setRevenues={setRevenues} expenses={expenses} setExpenses={setExpenses} projects={projects} customers={customers} suppliers={suppliers} />;
      case 'calendar': return <CalendarComponent projects={projects} calendarNotes={calendarNotes} setCalendarNotes={setCalendarNotes} />;
      case 'reports': return <Reports expenses={expenses} revenues={revenues} projects={projects} costs={costs} />;
      default: return <Dashboard projects={projects} costs={costs} revenues={revenues} expenses={expenses} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0c0a09] text-stone-200 overflow-hidden">
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-black border-r border-stone-800 transition-all duration-300 flex flex-col z-50`}>
        <div className="p-6 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 bg-amber-600 rounded flex-shrink-0 flex items-center justify-center shadow-lg shadow-amber-600/20">
              <span className="font-black text-white text-lg">W</span>
            </div>
            {isSidebarOpen && <h1 className="font-black text-lg tracking-tighter text-white">WOODFINANCE</h1>}
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-stone-900 rounded-lg text-stone-500">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className="flex-1 mt-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => handleTabChange(item.id as Tab)} 
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${activeTab === item.id ? 'bg-amber-600/10 text-amber-500 border border-amber-600/20' : 'text-stone-500 hover:text-stone-200 hover:bg-stone-900'}`}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span className="text-base font-semibold">{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-stone-950 border-b border-stone-800 px-8 py-5 flex items-center justify-between shadow-lg">
          <div className="flex flex-col">
            <h2 className="text-xs font-bold text-stone-600 uppercase tracking-widest">Painel Administrativo</h2>
            <h3 className="text-xl font-bold text-white tracking-tight">{navItems.find(i => i.id === activeTab)?.label}</h3>
          </div>
          <button 
            onClick={() => {
              if (window.confirm("Deseja limpar todos os dados do sistema e começar do zero?")) {
                localStorage.clear();
                window.location.reload();
              }
            }} 
            className="text-stone-600 hover:text-red-500 p-2.5 rounded-xl hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
            title="Resetar Woodfinance"
          >
            <RefreshCw size={18} />
          </button>
        </header>
        <section ref={mainContentRef} className="flex-1 overflow-y-auto p-8 bg-[#0c0a09]">{renderContent()}</section>
      </main>
    </div>
  );
};

export default App;
