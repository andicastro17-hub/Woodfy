
import React from 'react';
import { AlertCircle, CheckCircle2, DollarSign, Plus } from 'lucide-react';
import { GeneralExpense, PaymentStatus } from '../types';

interface ExpensesProps {
  expenses: GeneralExpense[];
  setExpenses: React.Dispatch<React.SetStateAction<GeneralExpense[]>>;
}

const Expenses: React.FC<ExpensesProps> = ({ expenses, setExpenses }) => {
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6">
      <div className="bg-stone-900 text-white p-8 rounded-3xl flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold mb-1">Despesas Administrativas</h3>
          <p className="text-stone-400 text-sm">Controle de custos fixos e operacionais que não estão ligados a obras específicas.</p>
        </div>
        <button className="bg-white text-stone-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2">
          <Plus size={20} /> Novo Gasto Fixo
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Descrição</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4">Vencimento</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {expenses.map(e => (
              <tr key={e.id} className="hover:bg-stone-50/50">
                <td className="px-6 py-4 font-bold text-stone-800">{e.description}</td>
                <td className="px-6 py-4 text-sm text-stone-500">{e.category}</td>
                <td className="px-6 py-4 text-sm text-stone-500">{e.dueDate}</td>
                <td className="px-6 py-4 font-bold text-red-600">{formatCurrency(e.value)}</td>
                <td className="px-6 py-4">
                  {e.status === PaymentStatus.PAID ? (
                    <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold uppercase">
                      <CheckCircle2 size={14} /> Pago
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-600 text-xs font-bold uppercase">
                      <AlertCircle size={14} /> Pendente
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Expenses;
