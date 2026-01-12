
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Check, TrendingUp, TrendingDown, Briefcase, Building, DollarSign, Pencil, Trash2, Home, ChevronDown } from 'lucide-react';
import { Revenue, PaymentStatus, Project, Cost, GeneralExpense, CostType, Customer, Supplier } from '../types';
import { PAYMENT_METHODS, EXPENSE_CATEGORIES, REVENUE_CATEGORIES } from '../constants';

interface FinancialsProps {
  revenues: Revenue[];
  setRevenues: React.Dispatch<React.SetStateAction<Revenue[]>>;
  projects: Project[];
  costs: Cost[];
  setCosts: React.Dispatch<React.SetStateAction<Cost[]>>;
  expenses: GeneralExpense[];
  setExpenses: React.Dispatch<React.SetStateAction<GeneralExpense[]>>;
  suppliers: Supplier[];
  customers: Customer[];
}

type TransactionType = 'revenue' | 'cost' | 'expense';
type RevenueType = 'project' | 'other';

interface Transaction {
  id: string;
  type: TransactionType;
  date: string;
  description: string;
  category: string;
  value: number;
  status: PaymentStatus;
}

type CurrentExitState = Partial<Cost & GeneralExpense>;

const Financials: React.FC<FinancialsProps> = ({ revenues, setRevenues, projects, costs, setCosts, expenses, setExpenses, suppliers, customers }) => {
  const [isRevenueModalOpen, setRevenueModalOpen] = useState(false);
  const [isExitModalOpen, setExitModalOpen] = useState(false);
  
  const [currentRevenue, setCurrentRevenue] = useState<Partial<Revenue>>({});
  const [revenueType, setRevenueType] = useState<RevenueType>('project');
  const [currentExit, setCurrentExit] = useState<CurrentExitState>({});
  const [exitType, setExitType] = useState<'cost' | 'expense'>('cost');
  
  const isEditingRevenue = useMemo(() => !!currentRevenue.id, [currentRevenue]);
  const isEditingExit = useMemo(() => !!currentExit.id, [currentExit]);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  const transactions = useMemo<Transaction[]>(() => {
    const allRevenues: Transaction[] = revenues.map(r => ({
      id: r.id,
      type: 'revenue',
      date: r.date,
      description: r.projectId ? (projects.find(p => p.id === r.projectId)?.code || 'Projeto não encontrado') : (r.description || 'Receita Avulsa'),
      category: r.category || r.paymentMethod,
      value: Number(r.value),
      status: r.status
    }));
    const allCosts: Transaction[] = costs.map(c => {
      let description = c.description;
      if (c.projectId) {
        if (c.projectId === 'outros') {
          description = `Custo Geral: ${c.description}`;
        } else {
          const projectCode = projects.find(p => p.id === c.projectId)?.code || 'Projeto Removido';
          description = `${projectCode}: ${c.description}`;
        }
      }

      return {
        id: c.id,
        type: 'cost',
        date: c.date,
        description,
        category: c.type,
        value: -Number(c.value),
        status: PaymentStatus.PAID
      };
    });
    const allExpenses: Transaction[] = expenses.map(e => ({
      id: e.id,
      type: 'expense',
      date: e.dueDate,
      description: e.description,
      category: e.category,
      value: -Number(e.value),
      status: e.status
    }));

    return [...allRevenues, ...allCosts, ...allExpenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [revenues, costs, expenses, projects]);

  const summary = useMemo(() => {
    const totalIn = transactions.filter(t => t.value > 0 && t.status === PaymentStatus.PAID).reduce((acc, t) => acc + t.value, 0);
    const totalOut = transactions.filter(t => t.value < 0 && t.status === PaymentStatus.PAID).reduce((acc, t) => acc + t.value, 0);
    return { totalIn, totalOut, balance: totalIn + totalOut };
  }, [transactions]);
  
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    transactions.forEach(t => {
      const monthYear = t.date.substring(0, 7); // "YYYY-MM"
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(t);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a)); // Sort descending
  }, [transactions]);

  useEffect(() => {
    if (groupedTransactions.length > 0 && !expandedMonth) {
      setExpandedMonth(groupedTransactions[0][0]);
    }
  }, [groupedTransactions, expandedMonth]);

  const handleSaveRevenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRevenue.value || (revenueType === 'project' && !currentRevenue.projectId) || (revenueType === 'other' && !currentRevenue.description)) {
      return;
    }
    
    const revenueToSave = {
        ...currentRevenue,
        value: Number(currentRevenue.value),
        projectId: revenueType === 'project' ? currentRevenue.projectId : undefined,
    } as Revenue

    if (isEditingRevenue) {
        setRevenues(prev => prev.map(r => r.id === revenueToSave.id ? revenueToSave : r));
    } else {
        const newRevenue: Revenue = { ...revenueToSave, id: crypto.randomUUID() };
        setRevenues(prev => [...prev, newRevenue]);
    }
    setRevenueModalOpen(false);
  };
  
  const handleSaveExit = (e: React.FormEvent) => {
    e.preventDefault();

    const exitToSave = {
        ...currentExit,
        value: Number(currentExit.value)
    };

    if (exitType === 'cost') {
        if (isEditingExit) {
            setCosts(prev => prev.map(c => c.id === exitToSave.id ? exitToSave as Cost : c));
        } else {
            const cost: Cost = { id: crypto.randomUUID(), ...exitToSave } as Cost;
            setCosts(prev => [...prev, cost]);
        }
    } else {
        if (isEditingExit) {
            setExpenses(prev => prev.map(ex => ex.id === exitToSave.id ? exitToSave as GeneralExpense : ex));
        } else {
            const expense: GeneralExpense = { id: crypto.randomUUID(), ...exitToSave } as GeneralExpense;
            setExpenses(prev => [...prev, expense]);
        }
    }
    setExitModalOpen(false);
  };
  
  const handleDeleteTransaction = (id: string, type: TransactionType) => {
    if (!window.confirm("Tem certeza que deseja excluir esta transação?")) return;
    switch (type) {
      case 'revenue':
        setRevenues(prev => prev.filter(r => r.id !== id));
        break;
      case 'cost':
        setCosts(prev => prev.filter(c => c.id !== id));
        break;
      case 'expense':
        setExpenses(prev => prev.filter(e => e.id !== id));
        break;
    }
  };

  const handleEditTransaction = (id: string, type: TransactionType) => {
    if (type === 'revenue') {
        const revenue = revenues.find(r => r.id === id);
        if (revenue) {
            setCurrentRevenue(revenue);
            setRevenueType(revenue.projectId ? 'project' : 'other');
            setRevenueModalOpen(true);
        }
    } else if (type === 'cost') {
        const cost = costs.find(c => c.id === id);
        if (cost) {
            setExitType('cost');
            setCurrentExit(cost);
            setExitModalOpen(true);
        }
    } else if (type === 'expense') {
        const expense = expenses.find(e => e.id === id);
        if (expense) {
            setExitType('expense');
            setCurrentExit(expense);
            setExitModalOpen(true);
        }
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const formatMonthYear = (my: string) => {
    const [year, month] = my.split('-');
    return new Date(Number(year), Number(month) - 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-stone-800">Controle Financeiro</h3>
          <p className="text-stone-500 text-sm">Visualize todas as suas entradas e saídas em um único lugar.</p>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={() => {
                setCurrentRevenue({ status: PaymentStatus.PAID, paymentMethod: 'PIX', date: new Date().toISOString().split('T')[0] });
                setRevenueType('project');
                setRevenueModalOpen(true)
              }}
              className="bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-800 transition-colors"
            >
              <Plus size={18} /> Nova Receita
            </button>
            <button 
              onClick={() => {
                setCurrentExit({ date: new Date().toISOString().split('T')[0], dueDate: new Date().toISOString().split('T')[0], type: CostType.VARIABLE, status: PaymentStatus.PAID });
                setExitModalOpen(true);
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-red-700 transition-colors"
            >
              <Plus size={18} /> Nova Saída
            </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total de Entradas Pagas" value={formatCurrency(summary.totalIn)} icon={TrendingUp} color="emerald" />
        <StatCard label="Total de Saídas Pagas" value={formatCurrency(summary.totalOut)} icon={TrendingDown} color="red" />
        <StatCard label="Saldo Final (Pago)" value={formatCurrency(summary.balance)} icon={DollarSign} color={summary.balance >= 0 ? "stone" : "red"} />
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="space-y-1">
          {groupedTransactions.map(([monthYear, monthTransactions]) => {
            const monthSummary = monthTransactions.reduce((acc, t) => {
              if (t.status === PaymentStatus.PAID) {
                  if (t.value > 0) acc.totalIn += t.value;
                  else acc.totalOut += t.value;
              }
              return acc;
            }, { totalIn: 0, totalOut: 0 });
            const isExpanded = expandedMonth === monthYear;

            return (
              <div key={monthYear} className="border-b last:border-b-0 border-stone-100">
                <button 
                  onClick={() => setExpandedMonth(isExpanded ? null : monthYear)}
                  className="w-full p-4 text-left grid grid-cols-1 md:grid-cols-5 gap-4 items-center hover:bg-stone-50 transition-colors"
                >
                  <div className="flex items-center gap-2 col-span-2">
                    <ChevronDown size={20} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    <h4 className="font-bold text-lg text-stone-800 capitalize">{formatMonthYear(monthYear)}</h4>
                  </div>
                  <div className="text-emerald-600">
                    <span className="text-xs text-stone-400">Entradas Pagas</span>
                    <p className="font-bold">{formatCurrency(monthSummary.totalIn)}</p>
                  </div>
                  <div className="text-red-600">
                    <span className="text-xs text-stone-400">Saídas Pagas</span>
                    <p className="font-bold">{formatCurrency(monthSummary.totalOut)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-stone-400">Saldo do Mês</span>
                    <p className={`font-bold ${monthSummary.totalIn + monthSummary.totalOut >= 0 ? 'text-stone-800' : 'text-red-700'}`}>{formatCurrency(monthSummary.totalIn + monthSummary.totalOut)}</p>
                  </div>
                </button>
                {isExpanded && (
                  <div className="pb-4 px-4">
                    <div className="border-t border-stone-200 pt-4">
                        <table className="w-full text-left">
                            <thead className="bg-stone-50 text-stone-500 text-[10px] font-bold uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Data</th>
                                    <th className="px-6 py-4">Descrição / Projeto</th>
                                    <th className="px-6 py-4">Tipo</th>
                                    <th className="px-6 py-4">Categoria</th>
                                    <th className="px-6 py-4 text-right">Valor</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {monthTransactions.map(t => {
                                    const isIncome = t.value > 0;
                                    return (
                                        <tr key={`${t.type}-${t.id}`} className="hover:bg-stone-50/50 group">
                                            <td className="px-6 py-4 text-sm font-medium text-stone-500">{new Date(t.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                                            <td className="px-6 py-4 font-bold text-stone-800">{t.description}</td>
                                            <td className="px-6 py-4">
                                                <span className={`flex items-center gap-2 text-xs font-bold ${isIncome ? 'text-emerald-600' : 'text-red-600'}`}>
                                                {isIncome ? <TrendingUp size={14}/> : <TrendingDown size={14}/>} {isIncome ? 'Entrada' : 'Saída'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-stone-500">{t.category}</td>
                                            <td className={`px-6 py-4 text-right font-black ${isIncome ? 'text-emerald-700' : 'text-red-700'}`}>
                                                {formatCurrency(t.value)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`flex items-center justify-center gap-1 w-fit mx-auto text-[10px] font-bold px-2 py-1 rounded-full uppercase ${t.status === PaymentStatus.PAID ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                {t.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                <button onClick={() => handleEditTransaction(t.id, t.type)} className="p-2 rounded-lg text-stone-400 hover:text-amber-700 hover:bg-amber-50 transition-colors">
                                                    <Pencil size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteTransaction(t.id, t.type)} className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {isRevenueModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-stone-800">{isEditingRevenue ? 'Editar Receita' : 'Lançar Receita'}</h3>
              <button onClick={() => setRevenueModalOpen(false)} className="text-stone-400"><Plus size={24} className="rotate-45" /></button>
            </div>
            <form onSubmit={handleSaveRevenue} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase">Tipo de Receita</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setRevenueType('project')} className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 ${revenueType === 'project' ? 'border-emerald-600 bg-emerald-50' : 'border-stone-200 bg-white'}`}>
                    <Briefcase size={16} /> <span className="font-bold">De Projeto</span>
                  </button>
                  <button type="button" onClick={() => setRevenueType('other')} className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 ${revenueType === 'other' ? 'border-emerald-600 bg-emerald-50' : 'border-stone-200 bg-white'}`}>
                    <Home size={16} /> <span className="font-bold">Receita Avulsa</span>
                  </button>
                </div>
              </div>

              {revenueType === 'project' ? (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 uppercase">Vincular a Projeto</label>
                  <select required className="w-full border rounded-lg p-3 bg-stone-50" value={currentRevenue.projectId} onChange={e => setCurrentRevenue({...currentRevenue, projectId: e.target.value})}>
                    <option value="">Selecione um projeto...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.code} - {p.clientName}</option>)}
                  </select>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-500 uppercase">Descrição da Receita</label>
                    <input required className="w-full border rounded-lg p-3 bg-stone-50" placeholder="Ex: Venda de sobras de MDF" value={currentRevenue.description} onChange={e => setCurrentRevenue({...currentRevenue, description: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-500 uppercase">Categoria</label>
                    <select className="w-full border rounded-lg p-3 bg-stone-50" value={currentRevenue.category} onChange={e => setCurrentRevenue({...currentRevenue, category: e.target.value})}>
                      {REVENUE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 uppercase">Valor Recebido (R$)</label>
                  <input type="number" step="0.01" required className="w-full border rounded-lg p-3 bg-stone-50" value={currentRevenue.value} onChange={e => setCurrentRevenue({...currentRevenue, value: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 uppercase">Forma de Pagamento</label>
                  <select className="w-full border rounded-lg p-3 bg-stone-50" value={currentRevenue.paymentMethod} onChange={e => setCurrentRevenue({...currentRevenue, paymentMethod: e.target.value})}>
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 uppercase">Data do Recebimento</label>
                  <input type="date" required className="w-full border rounded-lg p-3 bg-stone-50" value={currentRevenue.date} onChange={e => setCurrentRevenue({...currentRevenue, date: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 uppercase">Status</label>
                   <select className="w-full border rounded-lg p-3 bg-stone-50" value={currentRevenue.status} onChange={e => setCurrentRevenue({...currentRevenue, status: e.target.value as PaymentStatus})}>
                    <option value={PaymentStatus.PAID}>Recebido</option>
                    <option value={PaymentStatus.PENDING}>Pendente / Agendado</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setRevenueModalOpen(false)} className="flex-1 border py-3 rounded-xl font-bold text-stone-500">Voltar</button>
                <button type="submit" className="flex-1 bg-emerald-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-700/20">{isEditingRevenue ? 'Salvar Alterações' : 'Finalizar Lançamento'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {isExitModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-stone-800">{isEditingExit ? 'Editar Saída' : 'Lançar Saída'}</h3>
              <button onClick={() => setExitModalOpen(false)} className="text-stone-400"><Plus size={24} className="rotate-45" /></button>
            </div>
            <form onSubmit={handleSaveExit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase">Tipo de Saída</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setExitType('cost')} className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 ${exitType === 'cost' ? 'border-amber-600 bg-amber-50' : 'border-stone-200 bg-white'}`}>
                    <Briefcase size={16} /> <span className="font-bold">Custo de Obra</span>
                  </button>
                  <button type="button" onClick={() => setExitType('expense')} className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 ${exitType === 'expense' ? 'border-amber-600 bg-amber-50' : 'border-stone-200 bg-white'}`}>
                    <Building size={16} /> <span className="font-bold">Despesa Fixa</span>
                  </button>
                </div>
              </div>

              {exitType === 'cost' ? (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-500 uppercase">Vincular a Projeto</label>
                    <select required className="w-full border rounded-lg p-2 bg-stone-50" value={currentExit.projectId || ''} onChange={e => setCurrentExit({...currentExit, projectId: e.target.value})}>
                      <option value="">Selecione um projeto...</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.code} - {p.clientName}</option>)}
                      <option key="outros" value="outros">Outros (Custo Geral de Obra)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-500 uppercase">Descrição do Gasto</label>
                    <input required className="w-full border rounded-lg p-2 bg-stone-50" placeholder="Ex: Dobradiças, Frete..." value={currentExit.description} onChange={e => setCurrentExit({...currentExit, description: e.target.value})} />
                  </div>
                   <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-500 uppercase">Valor (R$)</label>
                      <input type="number" step="0.01" required className="w-full border rounded-lg p-2 bg-stone-50" value={currentExit.value} onChange={e => setCurrentExit({...currentExit, value: Number(e.target.value)})} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-500 uppercase">Data</label>
                      <input type="date" required className="w-full border rounded-lg p-2 bg-stone-50" value={currentExit.date} onChange={e => setCurrentExit({...currentExit, date: e.target.value})} />
                    </div>
                  </div>
                </>
              ) : (
                 <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-500 uppercase">Descrição da Despesa</label>
                    <input required className="w-full border rounded-lg p-2 bg-stone-50" placeholder="Ex: Aluguel do Galpão" value={currentExit.description} onChange={e => setCurrentExit({...currentExit, description: e.target.value})} />
                  </div>
                   <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-500 uppercase">Valor (R$)</label>
                      <input type="number" step="0.01" required className="w-full border rounded-lg p-2 bg-stone-50" value={currentExit.value} onChange={e => setCurrentExit({...currentExit, value: Number(e.target.value)})} />
                    </div>
                     <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-500 uppercase">Data Vencimento</label>
                      <input type="date" required className="w-full border rounded-lg p-2 bg-stone-50" value={currentExit.dueDate} onChange={e => setCurrentExit({...currentExit, dueDate: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-500 uppercase">Categoria</label>
                      <select className="w-full border rounded-lg p-2 bg-stone-50" value={currentExit.category} onChange={e => setCurrentExit({...currentExit, category: e.target.value as GeneralExpense['category']})}>
                        {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                     <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-500 uppercase">Status</label>
                        <select className="w-full border rounded-lg p-2 bg-stone-50" value={currentExit.status} onChange={e => setCurrentExit({...currentExit, status: e.target.value as PaymentStatus})}>
                            <option value={PaymentStatus.PAID}>Pago</option>
                            <option value={PaymentStatus.PENDING}>Pendente</option>
                        </select>
                    </div>
                  </div>
                </>
              )}
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setExitModalOpen(false)} className="flex-1 border py-3 rounded-xl font-bold text-stone-500">Cancelar</button>
                <button type="submit" className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-600/20">{isEditingExit ? 'Salvar Alterações' : 'Adicionar Saída'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string, icon: any, color: 'emerald' | 'red' | 'stone' }> = ({ label, value, icon: Icon, color }) => {
  const colors = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
    red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100' },
    stone: { bg: 'bg-stone-100', text: 'text-stone-700', border: 'border-stone-200' },
  }
  return (
    <div className={`p-6 rounded-2xl border ${colors[color].bg} ${colors[color].border}`}>
      <div className={`flex items-center gap-2 font-bold text-xs uppercase mb-2 ${colors[color].text}`}>
        <Icon size={16} /> {label}
      </div>
      <p className={`text-3xl font-black ${colors[color].text}`}>{value}</p>
    </div>
  )
}

export default Financials;