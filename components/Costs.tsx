
import React, { useState } from 'react';
import { Plus, Trash2, Tag, Calendar, User } from 'lucide-react';
import { Cost, CostCategory, CostType, Project } from '../types';

interface CostsProps {
  costs: Cost[];
  setCosts: React.Dispatch<React.SetStateAction<Cost[]>>;
  projects: Project[];
}

const Costs: React.FC<CostsProps> = ({ costs, setCosts, projects }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCost, setNewCost] = useState<Partial<Cost>>({
    category: CostCategory.MATERIAL,
    type: CostType.VARIABLE,
    date: new Date().toISOString().split('T')[0],
    value: 0
  });

  const handleAddCost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCost.projectId) return;
    const cost: Cost = {
      ...newCost,
      id: Date.now().toString(),
    } as Cost;
    setCosts([...costs, cost]);
    setIsModalOpen(false);
  };

  const removeCost = (id: string) => {
    setCosts(costs.filter(c => c.id !== id));
  };

  const getProjectCode = (id: string) => projects.find(p => p.id === id)?.code || 'N/A';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-stone-800">Registro Detalhado de Despesas</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-stone-900 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
        >
          <Plus size={20} /> Novo Lançamento
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {costs.map(c => (
          <div key={c.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm relative group">
            <button 
              onClick={() => removeCost(c.id)}
              className="absolute top-4 right-4 p-1.5 text-stone-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={16} />
            </button>
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-stone-50 rounded-xl">
                <Tag className="text-stone-400" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-stone-800">{c.description}</h4>
                <p className="text-xs text-stone-500 font-medium">Ref: {getProjectCode(c.projectId)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-stone-50">
              <span className="text-xl font-black text-stone-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.value)}
              </span>
              <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${c.type === CostType.FIXED ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>
                {c.type}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-4 text-[11px] text-stone-400 font-bold uppercase">
              <span className="flex items-center gap-1"><Calendar size={12} /> {c.date}</span>
              <span className="flex items-center gap-1"><User size={12} /> {c.category}</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-stone-800">Novo Lançamento de Custo</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400"><Plus size={24} className="rotate-45" /></button>
            </div>
            <form onSubmit={handleAddCost} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-500 uppercase">Vincular a Projeto</label>
                <select required className="w-full border rounded-lg p-2 bg-stone-50" onChange={e => setNewCost({...newCost, projectId: e.target.value})}>
                  <option value="">Selecione um projeto...</option>
                  {/* Fixed: changed p.client to p.clientName */}
                  {projects.map(p => <option key={p.id} value={p.id}>{p.code} - {p.clientName}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-500 uppercase">Descrição do Gasto</label>
                <input required className="w-full border rounded-lg p-2 bg-stone-50" placeholder="Ex: Dobradiças, Frete..." onChange={e => setNewCost({...newCost, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 uppercase">Valor (R$)</label>
                  <input type="number" required className="w-full border rounded-lg p-2 bg-stone-50" onChange={e => setNewCost({...newCost, value: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 uppercase">Data</label>
                  <input type="date" required className="w-full border rounded-lg p-2 bg-stone-50" value={newCost.date} onChange={e => setNewCost({...newCost, date: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 uppercase">Categoria</label>
                  <select className="w-full border rounded-lg p-2 bg-stone-50" onChange={e => setNewCost({...newCost, category: e.target.value as CostCategory})}>
                    {Object.values(CostCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 uppercase">Tipo</label>
                  <select className="w-full border rounded-lg p-2 bg-stone-50" onChange={e => setNewCost({...newCost, type: e.target.value as CostType})}>
                    <option value={CostType.VARIABLE}>Variável</option>
                    <option value={CostType.FIXED}>Fixo</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border py-3 rounded-lg font-bold text-stone-500">Cancelar</button>
                <button type="submit" className="flex-1 bg-amber-700 text-white py-3 rounded-lg font-bold shadow-lg shadow-amber-700/20">Registrar Custo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Costs;
