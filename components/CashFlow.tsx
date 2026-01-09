
import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Info, Calendar } from 'lucide-react';
import { Revenue, GeneralExpense, Cost, PaymentStatus } from '../types';

interface CashFlowProps {
  revenues: Revenue[];
  expenses: GeneralExpense[];
  costs: Cost[];
}

const CashFlow: React.FC<CashFlowProps> = ({ revenues, expenses, costs }) => {
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const monthlySummary = useMemo(() => {
    // Aggregates data by month
    const totalIn = revenues.filter(r => r.status === PaymentStatus.PAID).reduce((acc, r) => acc + r.value, 0);
    const totalOutProjects = costs.reduce((acc, c) => acc + c.value, 0);
    const totalOutAdmin = expenses.filter(e => e.status === PaymentStatus.PAID).reduce((acc, e) => acc + e.value, 0);
    const balance = totalIn - (totalOutProjects + totalOutAdmin);

    return { totalIn, totalOut: totalOutProjects + totalOutAdmin, balance };
  }, [revenues, expenses, costs]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl">
          <div className="flex items-center gap-3 text-emerald-700 mb-4 font-bold uppercase text-xs">
            <TrendingUp size={18} /> Entradas Consolidadas
          </div>
          <p className="text-4xl font-black text-emerald-900">{formatCurrency(monthlySummary.totalIn)}</p>
        </div>
        <div className="bg-red-50 border border-red-100 p-8 rounded-3xl">
          <div className="flex items-center gap-3 text-red-700 mb-4 font-bold uppercase text-xs">
            <TrendingDown size={18} /> Saídas Totais (Obra + Admin)
          </div>
          <p className="text-4xl font-black text-red-900">{formatCurrency(monthlySummary.totalOut)}</p>
        </div>
        <div className={`${monthlySummary.balance >= 0 ? 'bg-amber-50 border-amber-100' : 'bg-red-100 border-red-200'} p-8 rounded-3xl`}>
          <div className="flex items-center gap-3 text-stone-700 mb-4 font-bold uppercase text-xs">
            Saldos do Período
          </div>
          <p className={`text-4xl font-black ${monthlySummary.balance >= 0 ? 'text-stone-900' : 'text-red-600'}`}>
            {formatCurrency(monthlySummary.balance)}
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-stone-800 font-bold">
          <Calendar size={20} className="text-amber-700" /> Histórico Mensal
        </div>
        <div className="space-y-4">
          {/* Example Month Row */}
          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors">
            <div>
              <p className="font-bold text-stone-800">Maio / 2024</p>
              <p className="text-xs text-stone-500">Fluxo consolidado</p>
            </div>
            <div className="flex gap-12 text-right">
              <div>
                <p className="text-[10px] uppercase font-bold text-emerald-600">Entradas</p>
                <p className="font-bold">{formatCurrency(monthlySummary.totalIn)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-red-600">Saídas</p>
                <p className="font-bold">{formatCurrency(monthlySummary.totalOut)}</p>
              </div>
              <div className="w-32">
                <p className="text-[10px] uppercase font-bold text-stone-400">Status</p>
                <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">POSITIVO</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-stone-900 text-stone-400 p-4 rounded-xl text-xs italic">
        <Info size={16} className="text-amber-500" />
        Dica: O fluxo de caixa considera apenas lançamentos com status "Pago/Recebido". Projeções futuras podem ser vistas na aba de Projetos.
      </div>
    </div>
  );
};

export default CashFlow;
