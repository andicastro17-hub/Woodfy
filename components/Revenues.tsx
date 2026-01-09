
import React, { useState } from 'react';
import { Plus, Check, Search, CreditCard } from 'lucide-react';
import { Revenue, PaymentStatus, Project } from '../types';
import { PAYMENT_METHODS } from '../constants';

interface RevenuesProps {
  revenues: Revenue[];
  setRevenues: React.Dispatch<React.SetStateAction<Revenue[]>>;
  projects: Project[];
}

const Revenues: React.FC<RevenuesProps> = ({ revenues, setRevenues, projects }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRevenue, setNewRevenue] = useState<Partial<Revenue>>({
    status: PaymentStatus.PAID,
    paymentMethod: 'PIX',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddRevenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRevenue.projectId) return;
    const revenue: Revenue = {
      ...newRevenue,
      id: Date.now().toString(),
    } as Revenue;
    setRevenues([...revenues, revenue]);
    setIsModalOpen(false);
  };

  const getProjectInfo = (id: string) => projects.find(p => p.id === id);

  return (
    <div className="space-y-6">
      <div className="bg-emerald-800 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-emerald-900/10">
        <div>
          <h3 className="text-2xl font-bold mb-2">Controle de Entradas</h3>
          <p className="text-emerald-100 text-sm max-w-md">Registre todos os pagamentos recebidos de clientes para manter o fluxo de caixa positivo.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-emerald-800 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-50 transition-colors"
        >
          <Plus size={20} /> Registrar Pagamento
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 text-stone-500 text-[10px] font-bold uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Projeto / Cliente</th>
              <th className="px-6 py-4">Forma</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {revenues.map(r => {
              const proj = getProjectInfo(r.projectId);
              return (
                <tr key={r.id} className="hover:bg-stone-50/50">
                  <td className="px-6 py-4 text-sm font-medium text-stone-500">{r.date}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-stone-800">{proj?.code}</p>
                    {/* Fixed: changed proj?.client to proj?.clientName */}
                    <p className="text-xs text-stone-400">{proj?.clientName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-stone-600 font-medium text-sm">
                      <CreditCard size={14} className="text-stone-400" /> {r.paymentMethod}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black text-emerald-700">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(r.value)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1 w-fit text-[10px] font-bold px-2 py-1 rounded-full uppercase ${r.status === PaymentStatus.PAID ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {r.status === PaymentStatus.PAID ? <Check size={12} /> : null} {r.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-stone-800">Lançar Recebimento</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400"><Plus size={24} className="rotate-45" /></button>
            </div>
            <form onSubmit={handleAddRevenue} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-500 uppercase">Vincular a Projeto</label>
                <select required className="w-full border rounded-lg p-3 bg-stone-50" onChange={e => setNewRevenue({...newRevenue, projectId: e.target.value})}>
                  <option value="">Selecione um projeto...</option>
                  {/* Fixed: changed p.client to p.clientName */}
                  {projects.map(p => <option key={p.id} value={p.id}>{p.code} - {p.clientName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 uppercase">Valor Recebido (R$)</label>
                  <input type="number" required className="w-full border rounded-lg p-3 bg-stone-50" onChange={e => setNewRevenue({...newRevenue, value: Number(e.target.value)})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 uppercase">Forma de Pagamento</label>
                  <select className="w-full border rounded-lg p-3 bg-stone-50" onChange={e => setNewRevenue({...newRevenue, paymentMethod: e.target.value})}>
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 uppercase">Data do Recebimento</label>
                  <input type="date" required className="w-full border rounded-lg p-3 bg-stone-50" value={newRevenue.date} onChange={e => setNewRevenue({...newRevenue, date: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-500 uppercase">Status</label>
                   <select className="w-full border rounded-lg p-3 bg-stone-50" onChange={e => setNewRevenue({...newRevenue, status: e.target.value as PaymentStatus})}>
                    <option value={PaymentStatus.PAID}>Recebido</option>
                    <option value={PaymentStatus.PENDING}>Pendente / Agendado</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border py-3 rounded-xl font-bold text-stone-500">Voltar</button>
                <button type="submit" className="flex-1 bg-emerald-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-700/20">Finalizar Lançamento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Revenues;
