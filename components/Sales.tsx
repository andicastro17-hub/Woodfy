
import React from 'react';
import { ShoppingCart, ExternalLink } from 'lucide-react';
import { Project, Revenue } from '../types';

interface SalesProps {
  projects: Project[];
  revenues: Revenue[];
}

const Sales: React.FC<SalesProps> = ({ projects, revenues }) => {
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
          <p className="text-xs font-bold text-stone-400 uppercase mb-1">Vendas Totais</p>
          <p className="text-3xl font-black text-stone-900">
            {formatCurrency(projects.reduce((acc, p) => acc + p.valueSold, 0))}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
          <p className="text-xs font-bold text-stone-400 uppercase mb-1">Ticket Médio</p>
          <p className="text-3xl font-black text-amber-700">
            {formatCurrency(projects.length > 0 ? projects.reduce((acc, p) => acc + p.valueSold, 0) / projects.length : 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
          <p className="text-xs font-bold text-stone-400 uppercase mb-1">Conversão Comercial</p>
          <p className="text-3xl font-black text-emerald-700">84%</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Projeto</th>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4 text-right">Valor do Contrato</th>
              <th className="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {projects.map(p => (
              <tr key={p.id} className="hover:bg-stone-50">
                <td className="px-6 py-4 text-sm text-stone-500">{p.startDate}</td>
                <td className="px-6 py-4 font-bold text-stone-800">{p.code}</td>
                <td className="px-6 py-4 text-stone-600">{p.clientName}</td>
                <td className="px-6 py-4 text-right font-black text-stone-900">{formatCurrency(p.valueSold)}</td>
                <td className="px-6 py-4 text-center">
                  <button className="text-amber-700 hover:bg-amber-50 p-2 rounded-lg transition-colors">
                    <ExternalLink size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Sales;
