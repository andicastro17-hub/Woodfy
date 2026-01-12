
import React, { useState, useMemo, useEffect } from 'react';
import { Calculator, DollarSign, PieChart as PieChartIcon, Plus, Save, Trash2, Pencil, X, AlertTriangle, FileText } from 'lucide-react';
import { Customer, Budget, BudgetItem } from '../types';

const MULTIPLIERS = [2, 2.3, 2.5, 2.7, 3, 3.5, 4];

const PREDEFINED_BUDGET_ITEMS = [
  'MDF 18mm Branco TX',
  'MDF 15mm Branco TX',
  'MDF Branco TX 6mm',
  'Fita de Borda 22mm',
  'Fita de Borda 45mm',
  'Corrediças Telescópicas',
  'Corrediças Ocultas',
  'Dobradiça Reta',
  'Dobradiça Curva',
  'Dobradiça Super Curva',
  'Dobradiças Robô',
  'Cola de Contato',
  'Cola Superbond',
  'Parafusos (caixa)',
  'Puxadores',
  'Metalons',
  'Usinagem',
  'Terceirização',
  'Pintura',
  'Frete',
  'Espelho (m²)',
  'Vidro Incolor (m²)',
];

interface SimulatorProps {
  customers: Customer[];
  budgets: Budget[];
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
}

const Simulator: React.FC<SimulatorProps> = ({ customers, budgets, setBudgets }) => {
  const [cost, setCost] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(2.5);
  const [taxes, setTaxes] = useState<number>(6);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState<Partial<Budget>>({});
  const [manualCustomerName, setManualCustomerName] = useState('');
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);

  const isEditing = useMemo(() => budgets.some(b => b.id === currentBudget.id), [currentBudget, budgets]);

  // Sincroniza a calculadora com o orçamento selecionado na tabela
  useEffect(() => {
    if (selectedBudgetId) {
      const selectedBudget = budgets.find(b => b.id === selectedBudgetId);
      if (selectedBudget) {
        setCost(selectedBudget.totalCost);
        setMultiplier(selectedBudget.multiplier);
        setTaxes(selectedBudget.taxes);
      }
    } else {
      setCost(0);
    }
  }, [selectedBudgetId, budgets]);

  const results = useMemo(() => {
    if (taxes >= 100) return { price: 0, profit: 0, finalMargin: 0 };
    const price = (cost * multiplier) / (1 - taxes / 100);
    const profit = price - cost - (price * (taxes / 100));
    return { price, profit, finalMargin: price > 0 ? (profit / price) * 100 : 0 };
  }, [cost, multiplier, taxes]);
  
  const selectedBudgetName = useMemo(() => {
    if (!selectedBudgetId) return null;
    return budgets.find(b => b.id === selectedBudgetId)?.customerName;
  }, [selectedBudgetId, budgets]);


  const handleOpenModal = (budget?: Budget) => {
    if (budget) {
      setCurrentBudget(JSON.parse(JSON.stringify(budget)));
      setManualCustomerName(budget.customerId === 'outros' ? budget.customerName : '');
    } else {
      setCurrentBudget({
        id: crypto.randomUUID(),
        date: new Date().toISOString().split('T')[0],
        items: [{ id: crypto.randomUUID(), description: PREDEFINED_BUDGET_ITEMS[0], quantity: 1, unitPrice: 0, totalPrice: 0 }],
        status: 'Rascunho',
        multiplier: 2.5,
        taxes: 6,
        customerId: '',
      });
      setManualCustomerName('');
    }
    setIsModalOpen(true);
  };

  const handleUpdateSelectedBudget = () => {
    if (!selectedBudgetId) return;

    setBudgets(prevBudgets =>
      prevBudgets.map(b => {
        if (b.id === selectedBudgetId) {
          return {
            ...b,
            multiplier: multiplier,
            taxes: taxes,
            finalPrice: results.price,
          };
        }
        return b;
      })
    );
    
    alert('Orçamento atualizado com sucesso!');
    setSelectedBudgetId(null);
  };
  
  const handleSaveSimulation = () => {
    if (cost <= 0) return;
    
    const newBudget: Budget = {
      id: crypto.randomUUID(),
      customerId: 'outros',
      customerName: 'Simulação Rápida',
      date: new Date().toISOString().split('T')[0],
      items: [{ id: crypto.randomUUID(), description: 'Simulação de Custo', quantity: 1, unitPrice: cost, totalPrice: cost }],
      totalCost: cost,
      multiplier,
      taxes,
      finalPrice: results.price,
      status: 'Rascunho'
    };

    setBudgets(prev => [newBudget, ...prev]);
    alert("Simulação salva com sucesso no Showroom!");
    setCost(0);
  };


  const handleSaveBudget = () => {
    if (!currentBudget.customerId) return;
    const customer = customers.find(c => c.id === currentBudget.customerId);
    const finalName = currentBudget.customerId === 'outros' ? manualCustomerName || 'Avulso' : customer?.name || '';
    const totalCost = currentBudget.items?.reduce((a, b) => a + b.totalPrice, 0) || 0;
    const currentMultiplier = currentBudget.multiplier || 2.5;
    const currentTaxes = currentBudget.taxes || 6;
    const finalPrice = (totalCost * currentMultiplier) / (1 - currentTaxes / 100);

    const budgetToSave = { ...currentBudget, customerName: finalName, totalCost, finalPrice, multiplier: currentMultiplier, taxes: currentTaxes } as Budget;
    setBudgets(prev => isEditing ? prev.map(b => b.id === budgetToSave.id ? budgetToSave : b) : [...prev, budgetToSave]);
    setIsModalOpen(false);
  };

  const confirmDeleteBudget = () => {
    if (budgetToDelete) {
      setBudgets(prev => prev.filter(b => b.id !== budgetToDelete));
      setBudgetToDelete(null);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Showroom de Orçamentos</h3>
            <p className="text-stone-500 text-sm font-medium">Memória de cálculo detalhada por projeto.</p>
          </div>
          <button onClick={() => handleOpenModal()} className="bg-amber-600 text-white px-8 py-4 rounded-[1.25rem] font-black flex items-center gap-3 shadow-xl shadow-amber-600/20 hover:bg-amber-700 transition-all text-xs uppercase tracking-widest">
            <Plus size={20} strokeWidth={3} /> Gerar Orçamento Técnico
          </button>
        </div>
        
        <div className="bg-stone-900/40 rounded-[2.5rem] border border-stone-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-stone-950/50 text-stone-500 text-xs font-black uppercase tracking-[0.2em]">
                  <tr>
                      <th className="px-8 py-6">Emissão</th>
                      <th className="px-8 py-6">Cliente</th>
                      <th className="px-8 py-6 text-right">Insumos</th>
                      <th className="px-8 py-6 text-right">Sugestão Woodfy</th>
                      <th className="px-8 py-6 text-center">Status</th>
                      <th className="px-8 py-6 text-center">Ações</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {budgets.map(b => (
                  <tr 
                    key={b.id} 
                    className={`group transition-all duration-300 cursor-pointer ${selectedBudgetId === b.id ? 'bg-amber-600/10' : 'hover:bg-stone-800/30'}`}
                    onClick={() => setSelectedBudgetId(b.id === selectedBudgetId ? null : b.id)}
                  >
                    <td className="px-8 py-5 text-sm font-medium text-stone-500">{new Date(b.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                    <td className={`px-8 py-5 font-bold ${selectedBudgetId === b.id ? 'text-amber-400' : 'text-stone-300'}`}>{b.customerName}</td>
                    <td className="px-8 py-5 text-right font-black text-rose-500/80">{formatCurrency(b.totalCost)}</td>
                    <td className="px-8 py-5 text-right font-black text-emerald-500">{formatCurrency(b.finalPrice)}</td>
                    <td className="px-8 py-5 text-center">
                        <span className={`text-[11px] font-black uppercase px-3 py-1.5 rounded-full border ${b.status === 'Aprovado' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-stone-800 text-stone-500 border-stone-700'}`}>{b.status}</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            <button onClick={(e) => { e.stopPropagation(); handleOpenModal(b); }} className="p-2.5 rounded-xl bg-stone-950 text-stone-500 hover:text-amber-500 border border-stone-800"><Pencil size={16} /></button>
                            <button onClick={(e) => { e.stopPropagation(); setBudgetToDelete(b.id); }} className="p-2.5 rounded-xl bg-stone-950 text-stone-500 hover:text-rose-500 border border-stone-800"><Trash2 size={16} /></button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-stone-900/60 p-10 rounded-[2.5rem] border border-stone-800 space-y-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white flex items-center gap-3">
                <Calculator size={22} className="text-amber-500" />
                {selectedBudgetName ? `Analisando: ${selectedBudgetName}` : 'Calculadora Inteligente'}
              </h3>
              {selectedBudgetId && (
                <button onClick={() => setSelectedBudgetId(null)} className="text-xs font-bold text-stone-500 hover:text-white transition-colors bg-stone-800 px-3 py-1 rounded-lg">Limpar</button>
              )}
            </div>
            <div className="space-y-6">
               <div className="space-y-2">
                <label className="text-xs font-black text-stone-600 uppercase tracking-[0.2em] ml-1">Custo de Produção (R$)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-700" size={20} />
                  <input 
                    type="number" 
                    className={`w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 pl-12 text-xl font-black outline-none transition-colors ${selectedBudgetId ? 'text-amber-400 cursor-not-allowed' : 'text-stone-400 focus:border-amber-500'}`}
                    value={cost || ''} 
                    placeholder="Simular custo..."
                    readOnly={!!selectedBudgetId}
                    onChange={(e) => setCost(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-stone-600 uppercase tracking-[0.2em] ml-1">Fator Multiplicador</label>
                <div className="flex gap-2 flex-wrap">
                  {MULTIPLIERS.map(m => (
                    <button key={m} onClick={() => setMultiplier(m)} className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all border ${multiplier === m ? 'bg-amber-600 border-amber-600 text-white shadow-glow' : 'bg-stone-950 border-stone-800 text-stone-500 hover:border-stone-600'}`}>x{m}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-stone-600 uppercase tracking-[0.2em]">Carga Tributária (%)</label>
                  <span className="text-amber-500 font-black tabular-nums">{taxes}%</span>
                </div>
                <input type="range" min="0" max="30" className="w-full accent-amber-600" value={taxes} onChange={e => setTaxes(Number(e.target.value))} />
              </div>
            </div>
        </div>
        <div className="bg-black rounded-[2.5rem] p-12 text-white shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group border border-amber-500/5">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 to-transparent pointer-events-none"></div>
            <span className="text-amber-500 text-xs font-black uppercase tracking-[0.4em] mb-6 bg-amber-500/10 px-6 py-2 rounded-full border border-amber-500/20">Sugestão de Proposta</span>
            <p className="text-7xl font-black mb-8 tracking-tighter tabular-nums drop-shadow-2xl">{formatCurrency(results.price)}</p>
            <div className="grid grid-cols-2 gap-12 w-full max-w-sm mt-4 border-t border-stone-800 pt-8 pb-8">
              <div className="text-center">
                <p className="text-[11px] font-black text-stone-500 uppercase tracking-widest mb-2">Lucratividade</p>
                <p className="text-2xl font-black text-emerald-500 tabular-nums">{formatCurrency(results.profit)}</p>
              </div>
              <div className="text-center">
                <p className="text-[11px] font-black text-stone-500 uppercase tracking-widest mb-2">Margem de Ganho</p>
                <p className="text-2xl font-black text-amber-500 tabular-nums">{results.finalMargin.toFixed(1)}%</p>
              </div>
            </div>
            
            <button 
              onClick={selectedBudgetId ? handleUpdateSelectedBudget : handleSaveSimulation}
              disabled={selectedBudgetId ? false : cost <= 0}
              title={selectedBudgetId ? "Salvar alterações sobre o orçamento selecionado." : "Salvar esta simulação como um novo orçamento rápido."}
              className={`w-full max-w-sm py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 ${selectedBudgetId || cost > 0 ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-xl shadow-amber-600/20' : 'bg-stone-800 text-stone-600 cursor-not-allowed'}`}
            >
              <Save size={16} /> 
              {selectedBudgetId ? 'Salvar Alterações no Orçamento' : 'Salvar Simulação Rápida'}
            </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-stone-900 rounded-[3rem] w-full max-w-5xl h-[90vh] flex flex-col border border-stone-800 shadow-2xl">
            <div className="p-8 border-b border-stone-800 flex justify-between items-center">
              <div className="flex items-center gap-4 text-amber-500">
                <FileText size={28} />
                <h3 className="text-2xl font-black uppercase tracking-widest">Detalhamento de Insumos</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-800 rounded-full text-stone-500"><X size={30} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-12">
              <div className="grid grid-cols-3 gap-8">
                <InputGroup label="Cliente Final" type="select" value={currentBudget.customerId} onChange={v => setCurrentBudget({...currentBudget, customerId: v})}>
                  <option value="">Selecionar...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  <option value="outros">Manual...</option>
                </InputGroup>
                <InputGroup label="Data Emissão" type="date" value={currentBudget.date} onChange={v => setCurrentBudget({...currentBudget, date: v})} />
                <InputGroup label="Status" type="select" value={currentBudget.status} onChange={v => setCurrentBudget({...currentBudget, status: v as any})}>
                  <option value="Rascunho">Rascunho</option>
                  <option value="Enviado">Enviado</option>
                  <option value="Aprovado">Aprovado</option>
                  <option value="Rejeitado">Rejeitado</option>
                </InputGroup>
              </div>
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-stone-600 border-b border-stone-800 pb-2">Itens do Orçamento</h4>
                <div className="grid grid-cols-12 gap-4 items-center -mb-2 px-1">
                    <div className="col-span-6">
                        <label className="text-xs font-black text-stone-500 uppercase tracking-[0.2em]">Insumo</label>
                    </div>
                    <div className="col-span-2 text-center">
                        <label className="text-xs font-black text-stone-500 uppercase tracking-[0.2em]">Qtd.</label>
                    </div>
                    <div className="col-span-3 text-right">
                        <label className="text-xs font-black text-stone-500 uppercase tracking-[0.2em]">Preço Unitário</label>
                    </div>
                    <div className="col-span-1"></div>
                </div>
                {(currentBudget.items || []).map((item, idx) => {
                  const isManualEntry = !PREDEFINED_BUDGET_ITEMS.includes(item.description);
                  const selectValue = isManualEntry ? 'manual' : item.description;

                  const updateItem = (updates: Partial<BudgetItem>) => {
                    const newItems = [...(currentBudget.items || [])];
                    const currentItem = newItems[idx];
                    const newItem = { ...currentItem, ...updates };

                    if (updates.quantity !== undefined || updates.unitPrice !== undefined) {
                      newItem.totalPrice = (newItem.quantity ?? currentItem.quantity) * (newItem.unitPrice ?? currentItem.unitPrice);
                    }
                    
                    newItems[idx] = newItem;
                    setCurrentBudget({ ...currentBudget, items: newItems });
                  };

                  return (
                    <div key={item.id} className="grid grid-cols-12 gap-4 items-center animate-in slide-in-from-left-4" style={{ animationDelay: `${idx * 50}ms` }}>
                      <div className="col-span-6 space-y-2">
                        <select
                          className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-stone-300 font-bold"
                          value={selectValue}
                          onChange={(e) => {
                            const value = e.target.value;
                            updateItem({ description: value === 'manual' ? '' : value });
                          }}
                        >
                          {PREDEFINED_BUDGET_ITEMS.map(i => <option key={i} value={i}>{i}</option>)}
                          <option value="manual">Outro (descrever manualmente)...</option>
                        </select>
                        {isManualEntry && (
                          <input
                            type="text"
                            placeholder="Descrição do insumo manual..."
                            className="w-full bg-stone-950 border border-amber-900/50 rounded-xl p-3 text-stone-300 font-bold animate-in fade-in"
                            value={item.description}
                            onChange={(e) => updateItem({ description: e.target.value })}
                            required
                          />
                        )}
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-center font-black"
                          value={item.quantity}
                          onChange={(e) => updateItem({ quantity: Number(e.target.value) })}
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-right font-black"
                          value={item.unitPrice}
                          onChange={(e) => updateItem({ unitPrice: Number(e.target.value) })}
                        />
                      </div>
                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => setCurrentBudget({ ...currentBudget, items: currentBudget.items?.filter(it => it.id !== item.id) })}
                          className="text-stone-700 hover:text-rose-500"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                <button 
                  type="button"
                  onClick={() => setCurrentBudget({...currentBudget, items: [...(currentBudget.items || []), {id: crypto.randomUUID(), description: PREDEFINED_BUDGET_ITEMS[0], quantity: 1, unitPrice: 0, totalPrice: 0}]})} 
                  className="text-xs font-black uppercase text-amber-500 tracking-widest flex items-center gap-2 pt-4">
                  <Plus size={14} /> Novo Insumo
                </button>
              </div>
            </div>
            <div className="p-10 bg-black/40 border-t border-stone-800 flex justify-between items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-stone-500 mb-2">Investimento em Materiais</p>
                <p className="text-4xl font-black text-white">{formatCurrency(currentBudget.items?.reduce((a, b) => a + b.totalPrice, 0) || 0)}</p>
              </div>
              <button onClick={handleSaveBudget} className="bg-amber-600 text-white px-12 py-5 rounded-[1.5rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-amber-600/20 hover:bg-amber-700">Finalizar e Salvar</button>
            </div>
          </div>
        </div>
      )}

      {budgetToDelete && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
          <div className="bg-stone-900 rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl border border-rose-900/20 animate-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20 shadow-glow-red">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Apagar Orçamento?</h3>
              <p className="text-stone-500 text-sm font-medium leading-relaxed">
                Esta ação removerá permanentemente a memória de cálculo deste orçamento. Não poderá ser desfeita.
              </p>
            </div>
            <div className="p-6 bg-black/40 flex flex-col gap-3">
              <button onClick={confirmDeleteBudget} className="w-full bg-rose-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all">
                Apagar Definitivamente
              </button>
              <button onClick={() => setBudgetToDelete(null)} className="w-full bg-stone-800 text-stone-400 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-stone-700 transition-all">
                Manter Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InputGroup: React.FC<{label: string, type: 'select' | 'date' | 'number', value: any, onChange: (v: any) => void, children?: React.ReactNode}> = ({label, type, value, onChange, children}) => (
  <div className="space-y-2">
    <label className="text-xs font-black text-stone-600 uppercase tracking-widest ml-1">{label}</label>
    {type === 'select' ? (
      <select className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-300 font-bold outline-none focus:border-amber-500 transition-all" value={value} onChange={e => onChange(e.target.value)}>{children}</select>
    ) : (
      <input type={type} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-300 font-bold outline-none focus:border-amber-500 transition-all" value={value} onChange={e => onChange(e.target.value)} />
    )}
  </div>
);

export default Simulator;
