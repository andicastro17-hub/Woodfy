
import React, { useState, useMemo } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, ChevronDown, Calendar, X, Briefcase, Building, Repeat, Trash2, AlertTriangle } from 'lucide-react';
import { Revenue, PaymentStatus, Project, Cost, GeneralExpense, Customer, Supplier, CostType } from '../types';
import { PAYMENT_METHODS, EXPENSE_CATEGORIES, COST_CATEGORIES } from '../constants';

interface CashFlowProps {
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

const REVENUE_DESCRIPTION_OPTIONS = ["Adiantamento", "Parcela 1", "Parcela 2", "Parcela 3", "Pagamento Final", "À vista", "OUTROS"];

const CashFlow: React.FC<CashFlowProps> = ({ 
  revenues, setRevenues, projects, costs, setCosts, expenses, setExpenses, customers 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'in' | 'out'>('in');
  const [exitType, setExitType] = useState<'cost' | 'expense'>('cost');
  const [expandedMonth, setExpandedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [transactionToDelete, setTransactionToDelete] = useState<{ id: string; type: string; } | null>(null);
  const [manualRevenueDescription, setManualRevenueDescription] = useState('');

  // Estado para os formulários
  const [formData, setFormData] = useState<any>({
    description: '',
    value: '',
    date: new Date().toISOString().split('T')[0],
    category: COST_CATEGORIES[0],
    costCategory: COST_CATEGORIES[0],
    expenseCategory: EXPENSE_CATEGORIES[0],
    paymentMethod: 'PIX',
    projectId: ''
  });

  const handleOpenModal = (type: 'in' | 'out') => {
    setModalType(type);
    setExitType('cost');
    setManualRevenueDescription('');
    setFormData({
        description: '',
        value: '',
        date: new Date().toISOString().split('T')[0],
        category: COST_CATEGORIES[0],
        costCategory: COST_CATEGORIES[0],
        expenseCategory: EXPENSE_CATEGORIES[0],
        paymentMethod: 'PIX',
        projectId: ''
    });
    setIsModalOpen(true);
  };

  const transactions = useMemo(() => {
    const allRevenues = revenues.filter(r => r.status === PaymentStatus.PAID).map(r => {
      const project = r.projectId ? projects.find(p => p.id === r.projectId) : null;
      return {
        id: r.id, type: 'revenue', date: r.date, 
        description: project ? `${project.type}: ${r.description}` : (r.description || 'Entrada Avulsa'),
        category: r.category || project?.type || 'Venda',
        value: Number(r.value), status: r.status,
        clientName: project ? project.clientName : null,
        paymentMethod: r.paymentMethod
      };
    });
    const allCosts = costs.map(c => {
      const project = c.projectId ? projects.find(p => p.id === c.projectId) : null;
      return {
      id: c.id, type: 'cost', date: c.date, description: project ? `${project.type}: ${c.description || 'Custo de Material'}` : (c.description || 'Custo de Material'),
      category: c.category,
      value: -Number(c.value), status: PaymentStatus.PAID,
      clientName: project ? project.clientName : null,
      paymentMethod: c.paymentMethod || '-'
    }});
    const allExpenses = expenses.filter(e => e.status === PaymentStatus.PAID).map(e => ({
      id: e.id, type: 'expense', date: e.dueDate, description: e.description,
      category: e.category,
      value: -Number(e.value), status: e.status,
      clientName: null,
      paymentMethod: e.paymentMethod || '-'
    }));
    return [...allRevenues, ...allCosts, ...allExpenses].sort((a, b) => b.date.localeCompare(a.date));
  }, [revenues, costs, expenses, projects]);

  const grouped = useMemo(() => {
    const g: Record<string, any[]> = {};
    transactions.forEach(t => {
      const my = t.date.slice(0, 7);
      if (!g[my]) g[my] = [];
      g[my].push(t);
    });
    return g;
  }, [transactions]);

  const stats = useMemo(() => {
    const totalIn = transactions.filter(t => t.value > 0).reduce((a, b) => a + b.value, 0);
    const totalOut = transactions.filter(t => t.value < 0).reduce((a, b) => a + b.value, 0);
    return { totalIn, totalOut, balance: totalIn + totalOut };
  }, [transactions]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(formData.value);
    if (!val) return;

    if (modalType === 'in') {
      const finalDescription = formData.description === 'OUTROS' ? manualRevenueDescription : formData.description;
      if (!finalDescription) return;

      const newRev: Revenue = {
        id: crypto.randomUUID(),
        value: val,
        date: formData.date,
        status: PaymentStatus.PAID,
        category: formData.category,
        description: finalDescription,
        paymentMethod: formData.paymentMethod,
        projectId: formData.projectId || undefined,
      };
      setRevenues(prev => [...prev, newRev]);
    } else {
      if (exitType === 'cost') {
        const newCost: Cost = {
          id: crypto.randomUUID(),
          category: formData.costCategory,
          description: formData.description || 'Custo de Obra',
          value: val,
          date: formData.date,
          type: CostType.VARIABLE,
          projectId: formData.projectId || undefined,
          paymentMethod: formData.paymentMethod
        };
        setCosts(prev => [...prev, newCost]);
      } else {
        const newExp: GeneralExpense = {
          id: crypto.randomUUID(),
          description: formData.description || formData.expenseCategory,
          category: formData.expenseCategory as any,
          value: val,
          dueDate: formData.date,
          status: PaymentStatus.PAID,
          paymentMethod: formData.paymentMethod
        };
        setExpenses(prev => [...prev, newExp]);
      }
    }

    setIsModalOpen(false);
  };
  
  const handleDeleteTransaction = () => {
    if (!transactionToDelete) return;

    switch (transactionToDelete.type) {
        case 'revenue':
            setRevenues(prev => prev.filter(item => item.id !== transactionToDelete.id));
            break;
        case 'cost':
            setCosts(prev => prev.filter(item => item.id !== transactionToDelete.id));
            break;
        case 'expense':
            setExpenses(prev => prev.filter(item => item.id !== transactionToDelete.id));
            break;
    }
    setTransactionToDelete(null);
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-white tracking-tight">O que entrou e saiu</h3>
          <p className="text-stone-500 text-sm">Acompanhe o dinheiro da sua marcenaria no dia a dia.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={() => handleOpenModal('in')} 
            className="flex-1 md:flex-none bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/10 hover:bg-emerald-700 transition-all text-sm"
          >
            <Plus size={18} /> Novo Recebimento
          </button>
          <button 
            onClick={() => handleOpenModal('out')} 
            className="flex-1 md:flex-none bg-rose-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-rose-600/10 hover:bg-rose-700 transition-all text-sm"
          >
            <Plus size={18} /> Novo Pagamento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Dinheiro que Entrou" value={formatCurrency(stats.totalIn)} color="emerald" icon={TrendingUp} description="Total já recebido" />
        <StatCard label="Dinheiro que Saiu" value={formatCurrency(Math.abs(stats.totalOut))} color="rose" icon={TrendingDown} description="Total pago de custos" />
        <StatCard label="Saldo em Mãos" value={formatCurrency(stats.balance)} color="white" icon={DollarSign} description="O que sobrou no caixa" />
      </div>

      <div className="space-y-4">
        {Object.keys(grouped).length > 0 ? Object.keys(grouped).sort((a,b) => b.localeCompare(a)).map(my => {
          const isExp = expandedMonth === my;
          const monthStats = grouped[my].reduce((acc, t) => {
            if (t.value > 0) acc.in += t.value; else acc.out += t.value;
            return acc;
          }, { in: 0, out: 0 });
          const profitMargin = monthStats.in > 0 ? ((monthStats.in + monthStats.out) / monthStats.in) * 100 : 0;

          return (
            <div key={my} className="bg-stone-900/40 border border-stone-800 rounded-[2rem] overflow-hidden shadow-xl">
              <button onClick={() => setExpandedMonth(isExp ? '' : my)} className="w-full p-8 flex justify-between items-center hover:bg-stone-800/20 transition-all">
                <div className="flex items-center gap-4">
                  <Calendar className="text-stone-600" size={24} />
                  <h4 className="font-bold text-lg text-white capitalize">{new Date(my + '-02').toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</h4>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Margem de Lucro</p>
                    <p className={`font-black text-lg ${profitMargin >= 0 ? 'text-amber-500' : 'text-rose-500'}`}>{profitMargin.toFixed(1)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-1">Resultado do Mês</p>
                    <p className={`font-black text-lg ${monthStats.in + monthStats.out >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{formatCurrency(monthStats.in + monthStats.out)}</p>
                  </div>
                  <ChevronDown className={`text-stone-600 transition-transform duration-300 ${isExp ? 'rotate-180' : ''}`} size={20} />
                </div>
              </button>

              {isExp && (
                <div className="px-8 pb-8 animate-in slide-in-from-top-4 duration-300">
                  <table className="w-full text-left">
                    <thead className="text-stone-600 text-xs font-bold uppercase tracking-widest border-b border-stone-800">
                      <tr>
                        <th className="py-4">Data</th>
                        <th className="py-4">Descrição</th>
                        <th className="py-4">Moeda</th>
                        <th className="py-4 text-right">Valor Final</th>
                        <th className="py-4 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/50">
                      {grouped[my].map(t => (
                        <tr key={t.id} className="hover:bg-stone-800/20 transition-all group">
                          <td className="py-4 text-sm font-bold text-stone-500">{new Date(t.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                          <td className="py-4">
                            <p className="font-semibold text-stone-200">{t.description}</p>
                            {t.clientName ? 
                              <p className="text-sm font-bold text-amber-500/90">{t.clientName}</p> :
                              (t.category && <p className="text-sm text-stone-500 font-medium">{t.category}</p>)
                            }
                          </td>
                          <td className="py-4 text-sm font-medium text-stone-400">{t.paymentMethod}</td>
                          <td className={`py-4 text-right font-bold ${t.value > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{formatCurrency(t.value)}</td>
                          <td className="py-4 text-center">
                            <button onClick={() => setTransactionToDelete({ id: t.id, type: t.type })} className="p-2.5 rounded-xl text-stone-600 hover:text-rose-500 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100">
                               <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        }) : (
          <div className="py-20 flex flex-col items-center justify-center text-stone-600 space-y-4">
            <Repeat size={60} strokeWidth={1} />
            <p className="text-sm font-medium italic">Nenhuma movimentação paga registrada até agora.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-stone-900 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-stone-800 animate-in zoom-in duration-300">
            <div className="p-8 border-b border-stone-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white tracking-tight">
                {modalType === 'in' ? 'Registrar Nova Entrada' : 'Registrar Nova Saída'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-500 hover:text-white p-2 transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-10 space-y-6">
              {modalType === 'out' && (
                <div className="grid grid-cols-2 gap-2 bg-stone-950 p-1.5 rounded-2xl border border-stone-800">
                  <button type="button" onClick={() => setExitType('cost')} className={`py-2.5 rounded-xl text-sm font-bold transition-all ${exitType === 'cost' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'text-stone-500 hover:text-stone-300'}`}>Custo de Projeto</button>
                  <button type="button" onClick={() => setExitType('expense')} className={`py-2.5 rounded-xl text-sm font-bold transition-all ${exitType === 'expense' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'text-stone-500 hover:text-stone-300'}`}>Despesa Fixa</button>
                </div>
              )}

              { (modalType === 'in' || (modalType === 'out' && exitType === 'cost')) &&
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Vincular a Projeto (Opcional)</label>
                  <select 
                    className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-200 outline-none focus:border-amber-500 font-medium" 
                    value={formData.projectId} 
                    onChange={e => setFormData({...formData, projectId: e.target.value})}
                  >
                    <option value="">Nenhum / Lançamento Avulso</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.code} - {p.clientName}</option>)}
                  </select>
                </div>
              }

              {modalType === 'in' ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Referente a...</label>
                  <select
                    required
                    className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-200 outline-none focus:border-amber-500 font-medium"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  >
                    <option value="">Selecione...</option>
                    {REVENUE_DESCRIPTION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  {formData.description === 'OUTROS' && (
                    <input
                      required
                      placeholder="Descreva a entrada avulsa"
                      className="w-full bg-stone-950 border border-amber-800/50 rounded-2xl p-4 text-stone-200 outline-none focus:border-amber-500 font-medium mt-4 animate-in slide-in-from-top-2"
                      value={manualRevenueDescription}
                      onChange={e => setManualRevenueDescription(e.target.value)}
                    />
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">O que é?</label>
                  <input
                    required={exitType === 'cost'}
                    placeholder={exitType === 'cost' ? "Ex: Compra de Corrediças" : "Ex: Conta de Luz (Opcional)"}
                    className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-200 outline-none focus:border-amber-500 font-medium"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              )}


              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Valor (R$)</label>
                  <input type="number" step="0.01" required className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-200 outline-none focus:border-amber-500 font-bold" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Data do Lançamento</label>
                  <input type="date" required className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-200 outline-none focus:border-amber-500 font-medium" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>

              {modalType === 'in' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Método de Pagamento</label>
                    <select 
                      className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-200 outline-none focus:border-amber-500 font-medium" 
                      value={formData.paymentMethod} 
                      onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                    >
                      {PAYMENT_METHODS.map(method => <option key={method} value={method}>{method}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Categoria</label>
                    <select 
                      className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-200 outline-none focus:border-amber-500 font-medium" 
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="">Selecione uma categoria...</option>
                      {COST_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </>
              ) : exitType === 'cost' ? (
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Categoria de Custo</label>
                    <select 
                        className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-200 outline-none focus:border-amber-500 font-medium" 
                        value={formData.costCategory} 
                        onChange={e => setFormData({...formData, costCategory: e.target.value})}
                    >
                        {COST_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Categoria da Despesa</label>
                  <select 
                    className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-200 outline-none focus:border-amber-500 font-medium" 
                    value={formData.expenseCategory} 
                    onChange={e => setFormData({...formData, expenseCategory: e.target.value})}
                  >
                    {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              )}

              {modalType === 'out' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Método de Pagamento</label>
                  <select 
                    className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-200 outline-none focus:border-amber-500 font-medium" 
                    value={formData.paymentMethod} 
                    onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
                  >
                    {PAYMENT_METHODS.map(method => <option key={method} value={method}>{method}</option>)}
                  </select>
                </div>
              )}

              <div className="pt-8 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-stone-500 font-bold text-sm hover:text-stone-300 transition-colors">Cancelar</button>
                <button type="submit" className={`flex-1 ${modalType === 'in' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'} text-white py-4 rounded-2xl font-bold shadow-xl transition-all text-sm`}>
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {transactionToDelete && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
          <div className="bg-stone-900 rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl border border-rose-900/20 animate-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20 shadow-glow-red">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Apagar Lançamento?</h3>
              <p className="text-stone-500 text-sm font-medium leading-relaxed">
                Esta ação removerá permanentemente este registro do fluxo de caixa.
              </p>
            </div>
            <div className="p-6 bg-black/40 flex flex-col gap-3">
              <button onClick={handleDeleteTransaction} className="w-full bg-rose-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all">
                Apagar Definitivamente
              </button>
              <button onClick={() => setTransactionToDelete(null)} className="w-full bg-stone-800 text-stone-400 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-stone-700 transition-all">
                Manter Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<any> = ({ label, value, color, icon: Icon, description }) => {
  const themes = {
    emerald: 'text-emerald-500 border-emerald-900/10 bg-emerald-500/5',
    rose: 'text-rose-500 border-rose-900/10 bg-rose-500/5',
    white: 'text-white border-stone-800 bg-stone-900/60'
  }[color as 'emerald' | 'rose' | 'white'];

  return (
    <div className={`p-8 rounded-[2rem] border-2 shadow-2xl transition-all hover:scale-[1.02] ${themes}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-60">{label}</span>
        <div className={`p-2 rounded-lg ${color === 'emerald' ? 'bg-emerald-500/10' : color === 'rose' ? 'bg-rose-500/10' : 'bg-stone-500/10'}`}>
          <Icon size={18} className="opacity-80" />
        </div>
      </div>
      <p className="text-3xl font-black tracking-tighter tabular-nums mb-1">{value}</p>
      <p className="text-xs font-medium opacity-40 uppercase tracking-widest">{description}</p>
    </div>
  );
};

export default CashFlow;
