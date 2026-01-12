
import React, { useState, useMemo, useEffect } from 'react';
import { CheckCircle, AlertCircle, TrendingUp, TrendingDown, Pencil, Plus, DollarSign, Building, Landmark, ChevronDown, Calendar, X, AlertTriangle } from 'lucide-react';
import { Revenue, PaymentStatus, Project, GeneralExpense, Customer, Supplier } from '../types';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../constants';

interface AccountsPayableReceivableProps {
  revenues: Revenue[];
  setRevenues: React.Dispatch<React.SetStateAction<Revenue[]>>;
  expenses: GeneralExpense[];
  setExpenses: React.Dispatch<React.SetStateAction<GeneralExpense[]>>;
  projects: Project[];
  customers: Customer[];
  suppliers: Supplier[];
}

type EntryType = 'receivable' | 'payable';

const REVENUE_DESCRIPTION_OPTIONS = ["Adiantamento", "Parcela 1", "Parcela 2", "Parcela 3", "Pagamento Final", "À vista", "Outros"];

const AccountsPayableReceivable: React.FC<AccountsPayableReceivableProps> = ({ revenues, setRevenues, expenses, setExpenses, projects, customers, suppliers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<EntryType>('receivable');
  const [expandedMonth, setExpandedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [manualPayableDescription, setManualPayableDescription] = useState('');
  const [manualReceivableDescription, setManualReceivableDescription] = useState('');
  const [editingEntry, setEditingEntry] = useState<{ id: string; type: EntryType } | null>(null);
  const [formData, setFormData] = useState<any>({
    description: '',
    value: '',
    date: new Date().toISOString().split('T')[0],
    status: PaymentStatus.PENDING,
    projectId: '',
    category: 'Outros',
    supplierId: '',
    paymentMethod: 'PIX'
  });

  const pendingRevenues = useMemo(() => revenues.filter(r => r.status === PaymentStatus.PENDING || r.status === PaymentStatus.OVERDUE), [revenues]);
  const pendingExpenses = useMemo(() => expenses.filter(e => e.status === PaymentStatus.PENDING || e.status === PaymentStatus.OVERDUE), [expenses]);
  
  const totalReceivable = useMemo(() => pendingRevenues.reduce((acc, r) => acc + Number(r.value || 0), 0), [pendingRevenues]);
  const totalPayable = useMemo(() => pendingExpenses.reduce((acc, e) => acc + Number(e.value || 0), 0), [pendingExpenses]);
  const balance = useMemo(() => totalReceivable - totalPayable, [totalReceivable, totalPayable]);

  const allMonths = useMemo(() => {
    const year = new Date().getFullYear();
    return Array.from({ length: 12 }, (_, i) => {
      const month = (i + 1).toString().padStart(2, '0');
      return `${year}-${month}`;
    });
  }, []);

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const formatMonthName = (my: string) => {
    const [year, month] = my.split('-');
    return new Date(Number(year), Number(month) - 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  };
  
  const resetFormAndClose = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
    setManualPayableDescription('');
    setManualReceivableDescription('');
    setFormData({ description: '', value: '', date: new Date().toISOString().split('T')[0], status: PaymentStatus.PENDING, projectId: '', category: 'Outros', supplierId: '', paymentMethod: 'PIX' });
  };

  const handleOpenAddModal = () => {
    setEditingEntry(null);
    setFormData({ description: '', value: '', date: new Date().toISOString().split('T')[0], status: PaymentStatus.PENDING, projectId: '', category: 'Outros', supplierId: '', paymentMethod: 'PIX' });
    setIsModalOpen(true);
  };
  
  const handleOpenEditModal = (id: string, type: EntryType) => {
    setEntryType(type);
    setEditingEntry({ id, type });
    if (type === 'receivable') {
      const rev = revenues.find(r => r.id === id);
      if (rev) {
        const isPredefined = REVENUE_DESCRIPTION_OPTIONS.includes(rev.description || '');
        setFormData({
          description: isPredefined ? rev.description : 'Outros',
          value: rev.value,
          date: rev.date,
          status: rev.status,
          projectId: rev.projectId || '',
          category: rev.category || 'Outros',
          paymentMethod: rev.paymentMethod || 'PIX'
        });
        setManualReceivableDescription(isPredefined ? '' : (rev.description || ''));
      }
    } else {
      const exp = expenses.find(e => e.id === id);
      if (exp) {
        const isCustomDescription = !EXPENSE_CATEGORIES.includes(exp.description as any);
        setManualPayableDescription(isCustomDescription ? exp.description : '');
        setFormData({
          description: '', // Not directly used in form state for payables now
          value: exp.value,
          date: exp.dueDate,
          status: exp.status,
          category: isCustomDescription ? 'Outros' : exp.category,
          supplierId: exp.supplierId || '',
        });
      }
    }
    setIsModalOpen(true);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (entryType === 'receivable') {
        const finalDescription = formData.description === 'Outros' ? manualReceivableDescription : formData.description;
        if (!finalDescription) return;

        const project = projects.find(p => p.id === formData.projectId);

        const revenueData = {
            value: Number(formData.value),
            date: formData.date,
            status: formData.status,
            projectId: formData.projectId || undefined,
            description: finalDescription,
            category: project ? project.type : 'Receita Avulsa',
            paymentMethod: formData.paymentMethod,
        };

        if (editingEntry) {
            setRevenues(prev => prev.map(r => r.id === editingEntry.id ? { ...r, ...revenueData } : r));
        } else {
            const newRev: Revenue = { id: crypto.randomUUID(), ...revenueData };
            setRevenues(prev => [...prev, newRev]);
        }
    } else { // Payable
        const finalDescription = formData.category === 'Outros' ? manualPayableDescription : formData.category;
        if (!finalDescription) return;

        const expenseData = {
            value: Number(formData.value),
            dueDate: formData.date,
            status: formData.status,
            description: finalDescription,
            category: formData.category as any,
            supplierId: formData.supplierId || undefined,
        };

        if (editingEntry) {
            setExpenses(prev => prev.map(e => e.id === editingEntry.id ? { ...e, ...expenseData } : e));
        } else {
            const newExp: GeneralExpense = { id: crypto.randomUUID(), ...expenseData };
            setExpenses(prev => [...prev, newExp]);
        }
    }
    resetFormAndClose();
  };


  const handleMarkAsPaid = (id: string, type: 'rev' | 'exp') => {
    if (type === 'rev') {
      setRevenues(prev => prev.map(r => r.id === id ? { ...r, status: PaymentStatus.PAID } : r));
    } else {
      setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: PaymentStatus.PAID } : e));
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 w-full">
          <SummaryCard title="A Receber" value={formatCurrency(totalReceivable)} icon={TrendingUp} color="blue" />
          <SummaryCard title="A Pagar" value={formatCurrency(totalPayable)} icon={TrendingDown} color="red" />
          <SummaryCard title="Saldo Previsto" value={formatCurrency(balance)} icon={Landmark} color={balance >= 0 ? "stone" : "red"} />
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="bg-amber-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-amber-600/20 hover:bg-amber-700 transition-all text-sm"
        >
          <Plus size={20} /> Adicionar Lançamento
        </button>
      </div>

      <div className="space-y-4">
        {allMonths.map(my => {
          const monthRevs = pendingRevenues.filter(r => r.date.startsWith(my));
          const monthExps = pendingExpenses.filter(e => e.dueDate.startsWith(my));
          const isExpanded = expandedMonth === my;
          const hasData = monthRevs.length > 0 || monthExps.length > 0;

          return (
            <div key={my} className="bg-stone-900/40 border border-stone-800 rounded-3xl overflow-hidden shadow-lg backdrop-blur-sm">
              <button 
                onClick={() => setExpandedMonth(isExpanded ? '' : my)}
                className={`w-full p-8 flex justify-between items-center transition-all ${isExpanded ? 'bg-stone-800/20' : 'hover:bg-stone-800/40'}`}
              >
                <div className="flex items-center gap-4">
                  <Calendar className="text-stone-500" size={24} />
                  <h4 className="font-bold text-stone-100 capitalize text-lg">{formatMonthName(my)}</h4>
                  {!isExpanded && hasData && (
                    <div className="flex gap-2 ml-4">
                      {monthRevs.length > 0 && <span className="text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full uppercase tracking-widest">{monthRevs.length} Receber</span>}
                      {monthExps.length > 0 && <span className="text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full uppercase tracking-widest">{monthExps.length} Pagar</span>}
                    </div>
                  )}
                </div>
                <ChevronDown size={20} className={`text-stone-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {isExpanded && (
                <div className="px-8 pb-8 pt-2 animate-in slide-in-from-top-4 duration-300">
                  {hasData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {monthRevs.length > 0 && (
                        <div className="space-y-4">
                          <p className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-4 border-b border-stone-800 pb-2">Entradas Pendentes</p>
                          <div className="space-y-3">
                            {monthRevs.map(r => {
                                const project = projects.find(p => p.id === r.projectId);
                                return (
                                <div key={r.id} className="p-4 bg-stone-950/40 rounded-2xl border border-stone-800 flex justify-between items-center group hover:border-blue-500/30 transition-all">
                                    <div>
                                    <p className="font-bold text-stone-200">{project ? `${project.type} - ${project.clientName}` : 'Receita Avulsa'}</p>
                                    <p className="text-sm text-stone-500">{r.description} - Venc.: {new Date(r.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                    <span className="font-bold text-blue-400">{formatCurrency(r.value)}</span>
                                    <button onClick={() => handleOpenEditModal(r.id, 'receivable')} className="p-2 text-stone-500 rounded-xl hover:bg-amber-500/10 hover:text-amber-500 transition-all opacity-0 group-hover:opacity-100" title="Editar lançamento"><Pencil size={18} /></button>
                                    <button onClick={() => handleMarkAsPaid(r.id, 'rev')} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition-all" title="Confirmar recebimento"><CheckCircle size={18} /></button>
                                    </div>
                                </div>
                                )
                            })}
                          </div>
                        </div>
                      )}
                      {monthExps.length > 0 && (
                        <div className="space-y-4">
                          <p className="text-xs font-bold text-rose-400 uppercase tracking-[0.2em] mb-4 border-b border-stone-800 pb-2">Contas a Pagar</p>
                          <div className="space-y-3">
                            {monthExps.map(e => (
                              <div key={e.id} className="p-4 bg-stone-950/40 rounded-2xl border border-stone-800 flex justify-between items-center group hover:border-rose-500/30 transition-all">
                                <div>
                                  <p className="font-bold text-stone-200">{e.description}</p>
                                  <p className="text-sm text-stone-500">Vencimento: {new Date(e.dueDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-rose-400">{formatCurrency(e.value)}</span>
                                  <button onClick={() => handleOpenEditModal(e.id, 'payable')} className="p-2 text-stone-500 rounded-xl hover:bg-amber-500/10 hover:text-amber-500 transition-all opacity-0 group-hover:opacity-100" title="Editar lançamento"><Pencil size={18} /></button>
                                  <button onClick={() => handleMarkAsPaid(e.id, 'exp')} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition-all" title="Confirmar pagamento"><CheckCircle size={18} /></button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-stone-600 gap-4">
                      <AlertCircle size={40} strokeWidth={1} />
                      <p className="text-sm font-medium italic">Nenhum lançamento pendente para este período.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-stone-900 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-stone-800 animate-in zoom-in duration-300">
            <div className="p-8 border-b border-stone-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white tracking-tight">{editingEntry ? 'Editar Lançamento' : 'Novo Agendamento'}</h3>
              <button onClick={resetFormAndClose} className="text-stone-500 hover:text-white p-2 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveEntry} className="p-10 space-y-6 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-2 bg-stone-950 p-1.5 rounded-2xl border border-stone-800">
                <button type="button" onClick={() => setEntryType('receivable')} className={`py-3 rounded-xl text-sm font-bold uppercase transition-all ${entryType === 'receivable' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'text-stone-500 hover:text-stone-300'}`}>A Receber</button>
                <button type="button" onClick={() => setEntryType('payable')} className={`py-3 rounded-xl text-sm font-bold uppercase transition-all ${entryType === 'payable' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'text-stone-500 hover:text-stone-300'}`}>A Pagar</button>
              </div>

              {entryType === 'receivable' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Vincular a Projeto</label>
                    <select required className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-200 outline-none focus:border-amber-500 font-medium" value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})}>
                        <option value="">Selecione um projeto...</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.code} - {p.clientName}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Descrição</label>
                    <select required className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-200 outline-none focus:border-amber-500 font-medium" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}>
                      <option value="">Selecione...</option>
                      {REVENUE_DESCRIPTION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    {formData.description === 'Outros' && (
                      <input 
                        required 
                        placeholder="Descreva a receita" 
                        className="w-full mt-4 bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-200 outline-none focus:border-amber-500 animate-in slide-in-from-top-2 font-medium"
                        value={manualReceivableDescription}
                        onChange={e => setManualReceivableDescription(e.target.value)}
                      />
                    )}
                  </div>
                   <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Forma de Pagamento</label>
                    <select className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-200 outline-none focus:border-amber-500 font-medium" value={formData.paymentMethod} onChange={e => setFormData({...formData, paymentMethod: e.target.value})}>
                      {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </>
              ) : ( // Payable
                <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Fornecedor (Opcional)</label>
                  <select className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-200 outline-none focus:border-amber-500 font-medium" value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})}>
                      <option value="">Nenhum / Lançamento sem fornecedor</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Categoria</label>
                  <select required className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-200 outline-none focus:border-amber-500 font-medium" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                   {formData.category === 'Outros' && (
                      <input 
                        required 
                        placeholder="Descreva a despesa manualmente..." 
                        className="w-full mt-4 bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-200 outline-none focus:border-amber-500 animate-in slide-in-from-top-2 font-medium"
                        value={manualPayableDescription}
                        onChange={e => setManualPayableDescription(e.target.value)}
                      />
                    )}
                </div>
                </>
              )}


              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Valor Estimado</label>
                  <input type="number" step="0.01" required className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-200 outline-none focus:border-amber-500 font-bold" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Data Prevista</label>
                  <input type="date" required className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-200 outline-none focus:border-amber-500" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={resetFormAndClose} className="flex-1 py-4 text-stone-500 font-bold text-sm hover:text-stone-300 transition-colors">Descartar</button>
                <button type="submit" className="flex-1 bg-amber-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-amber-600/20 hover:bg-amber-700 transition-all text-sm">{editingEntry ? 'Salvar Alterações' : 'Agendar Lançamento'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SummaryCard: React.FC<{title: string; value: string; icon: React.ElementType; color: 'red' | 'stone' | 'blue'}> = ({ title, value, icon: Icon, color }) => {
    const themes = {
        red: { bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-500', valueText: 'text-rose-400'},
        stone: { bg: 'bg-stone-500/10', border: 'border-stone-500/20', text: 'text-stone-400', valueText: 'text-stone-200'},
        blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-500', valueText: 'text-blue-400'},
    };
    const c = themes[color];
    return (
        <div className={`${c.bg} ${c.border} p-8 rounded-3xl border transition-all hover:-translate-y-1 shadow-2xl`}>
            <div className={`flex items-center gap-2 ${c.text} font-bold text-xs uppercase mb-3 tracking-widest`}>
                <Icon size={14} /> {title}
            </div>
            <p className={`text-3xl font-black ${c.valueText} tracking-tighter tabular-nums`}>{value}</p>
        </div>
    );
};

export default AccountsPayableReceivable;
