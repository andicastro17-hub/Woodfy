
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Receipt, 
  TrendingUp, 
  Calculator, 
  Menu, 
  X, 
  Users, 
  Truck, 
  CreditCard, 
  ShoppingCart, 
  Repeat
} from 'lucide-react';
import { 
  Project, Cost, Revenue, Customer, Supplier, GeneralExpense, Sale 
} from './types';
import { 
  INITIAL_PROJECTS, INITIAL_COSTS, INITIAL_REVENUES, 
  INITIAL_CUSTOMERS, INITIAL_SUPPLIERS, INITIAL_EXPENSES 
} from './constants';

import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import Costs from './components/Costs';
import Revenues from './components/Revenues';
import Simulator from './components/Simulator';
import Customers from './components/Customers';
import Suppliers from './components/Suppliers';
import Expenses from './components/Expenses';
import Sales from './components/Sales';
import CashFlow from './components/CashFlow';

type Tab = 'dashboard' | 'projects' | 'costs' | 'revenues' | 'simulator' | 'customers' | 'suppliers' | 'expenses' | 'sales' | 'cashflow';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // States with LocalStorage Persistence
  const [projects, setProjects] = useState<Project[]>(() => JSON.parse(localStorage.getItem('mp_projects') || JSON.stringify(INITIAL_PROJECTS)));
  const [costs, setCosts] = useState<Cost[]>(() => JSON.parse(localStorage.getItem('mp_costs') || JSON.stringify(INITIAL_COSTS)));
  const [revenues, setRevenues] = useState<Revenue[]>(() => JSON.parse(localStorage.getItem('mp_revenues') || JSON.stringify(INITIAL_REVENUES)));
  const [customers, setCustomers] = useState<Customer[]>(() => JSON.parse(localStorage.getItem('mp_customers') || JSON.stringify(INITIAL_CUSTOMERS)));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => JSON.parse(localStorage.getItem('mp_suppliers') || JSON.stringify(INITIAL_SUPPLIERS)));
  const [expenses, setExpenses] = useState<GeneralExpense[]>(() => JSON.parse(localStorage.getItem('mp_expenses') || JSON.stringify(INITIAL_EXPENSES)));

  useEffect(() => {
    localStorage.setItem('mp_projects', JSON.stringify(projects));
    localStorage.setItem('mp_costs', JSON.stringify(costs));
    localStorage.setItem('mp_revenues', JSON.stringify(revenues));
    localStorage.setItem('mp_customers', JSON.stringify(customers));
    localStorage.setItem('mp_suppliers', JSON.stringify(suppliers));
    localStorage.setItem('mp_expenses', JSON.stringify(expenses));
  }, [projects, costs, revenues, customers, suppliers, expenses]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projetos', icon: Briefcase },
    { id: 'sales', label: 'Vendas', icon: ShoppingCart },
    { id: 'revenues', label: 'Receitas', icon: Receipt },
    { id: 'costs', label: 'Custos Obra', icon: CreditCard },
    { id: 'expenses', label: 'Despesas Fixas', icon: TrendingUp },
    { id: 'cashflow', label: 'Fluxo de Caixa', icon: Repeat },
    { id: 'customers', label: 'Clientes', icon: Users },
    { id: 'suppliers', label: 'Fornecedores', icon: Truck },
    { id: 'simulator', label: 'Simulador', icon: Calculator },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard projects={projects} costs={costs} revenues={revenues} expenses={expenses} />;
      case 'projects': return <Projects projects={projects} setProjects={setProjects} customers={customers} />;
      case 'costs': return <Costs costs={costs} setCosts={setCosts} projects={projects} />;
      case 'revenues': return <Revenues revenues={revenues} setRevenues={setRevenues} projects={projects} />;
      case 'simulator': return <Simulator />;
      case 'customers': return <Customers customers={customers} setCustomers={setCustomers} />;
      case 'suppliers': return <Suppliers suppliers={suppliers} setSuppliers={setSuppliers} />;
      case 'expenses': return <Expenses expenses={expenses} setExpenses={setExpenses} />;
      case 'sales': return <Sales projects={projects} revenues={revenues} />;
      case 'cashflow': return <CashFlow revenues={revenues} expenses={expenses} costs={costs} />;
      default: return <Dashboard projects={projects} costs={costs} revenues={revenues} expenses={expenses} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-stone-50 overflow-hidden">
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-stone-900 text-stone-100 transition-all duration-300 flex flex-col z-50`}>
        <div className="p-6 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 bg-amber-700 rounded flex-shrink-0 flex items-center justify-center">
              <span className="font-bold text-lg">W</span>
            </div>
            {isSidebarOpen && <h1 className="font-bold text-lg tracking-tight">Woodfy</h1>}
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-stone-800 rounded">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className="flex-1 mt-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id as Tab)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${activeTab === item.id ? 'bg-amber-700 text-white' : 'text-stone-400 hover:bg-stone-800'}`}>
              <item.icon size={20} />
              {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-stone-200 px-8 py-4 flex items-center justify-between shadow-sm">
          <h2 className="text-xl font-bold text-stone-800">{navItems.find(i => i.id === activeTab)?.label}</h2>
        </header>
        <section className="flex-1 overflow-y-auto p-8">{renderContent()}</section>
      </main>
    </div>
  );
};

export default App;
