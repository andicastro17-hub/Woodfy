import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { GeneralExpense, Revenue, Project, PaymentStatus, Cost, ProjectStatus } from '../types';
import { ChevronLeft, ChevronRight, PieChart as PieChartIcon, BarChart3, AlertCircle, Percent } from 'lucide-react';
import { CATEGORY_COLORS } from '../constants';

interface ReportsProps {
  expenses: GeneralExpense[];
  revenues: Revenue[];
  projects: Project[];
  costs: Cost[];
}

const MONTH_COLORS = ['#3b82f6', '#10b981', '#f97316', '#ec4899', '#8b5cf6', '#facc15', '#0ea5e9', '#ef4444', '#84cc16', '#6366f1', '#14b8a6', '#a855f7'];

const Reports: React.FC<ReportsProps> = ({ expenses, revenues, projects, costs }) => {
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [profitYearDate, setProfitYearDate] = useState(new Date());

  const selectedExpenseMonth = expenseDate.toISOString().slice(0, 7);
  const selectedProfitYear = profitYearDate.getFullYear().toString();

  const changeExpenseMonth = (offset: number) => {
    setExpenseDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + offset);
      return newDate;
    });
  };
  
  const changeProfitYear = (offset: number) => {
    setProfitYearDate(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(prev.getFullYear() + offset);
      return newDate;
    });
  };

  const expenseData = useMemo(() => {
    // Despesas gerais (fixas/operacionais)
    const monthlyExpenses = expenses.filter(e => e.dueDate.startsWith(selectedExpenseMonth) && e.status === PaymentStatus.PAID);
    const groupedExpenses = monthlyExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.value;
      return acc;
    }, {} as Record<string, number>);
    
    const generalExpenseData = Object.entries(groupedExpenses).map(([name, value]) => ({ name, value }));
    
    // Custos diretos de projetos (materiais, etc.) - todos somados
    const totalMonthlyProjectCosts = costs
      .filter(c => c.date.startsWith(selectedExpenseMonth))
      // FIX: Explicitly convert cost.value to a number to prevent type errors during arithmetic operation.
      .reduce((acc, cost) => acc + Number(cost.value), 0);

    const combinedData = [...generalExpenseData];
    if (totalMonthlyProjectCosts > 0) {
      combinedData.push({ name: 'Custos de Projetos', value: totalMonthlyProjectCosts });
    }

    return combinedData.sort((a,b) => b.value - a.value);
  }, [expenses, costs, selectedExpenseMonth]);

  const profitDataForYear = useMemo(() => {
    // Cálculo de margem real baseado no fluxo de caixa do ano.
    
    // 1. Total de ENTRADAS (Receitas pagas no ano)
    const totalIncome = revenues
      .filter(r => r.status === PaymentStatus.PAID && r.date.startsWith(selectedProfitYear))
      .reduce((sum, r) => sum + r.value, 0);

    // 2. Total de SAÍDAS (Custos de projeto + Despesas gerais pagas no ano)
    const totalProjectCostsInYear = costs
      .filter(c => c.date.startsWith(selectedProfitYear))
      .reduce((sum, c) => sum + c.value, 0);
      
    const totalGeneralExpensesInYear = expenses
      .filter(e => e.status === PaymentStatus.PAID && e.dueDate.startsWith(selectedProfitYear))
      .reduce((sum, e) => sum + e.value, 0);

    const totalOutcome = totalProjectCostsInYear + totalGeneralExpensesInYear;

    if (totalIncome === 0) {
      return { data: [], averageMargin: 0 };
    }

    const totalProfit = totalIncome - totalOutcome;
    const averageMargin = (totalProfit / totalIncome) * 100;
    const marginValue = parseFloat(averageMargin.toFixed(1));
    
    if (marginValue <= 0) {
        return { 
            data: [],
            averageMargin: marginValue
        };
    }

    return {
      data: [
        { name: 'Margem Real', value: marginValue },
        { name: 'Custos Totais', value: 100 - marginValue },
      ],
      averageMargin: marginValue
    };
  }, [revenues, costs, expenses, selectedProfitYear]);

  const revenueByCustomerData = useMemo(() => {
    const customerRevenue: Record<string, number> = {};
    
    const paidProjects = projects.filter(p => p.paymentStatus === PaymentStatus.PAID);

    paidProjects.forEach(project => {
      const clientName = project.clientName;
      customerRevenue[clientName] = (customerRevenue[clientName] || 0) + project.valueSold;
    });
    
    return Object.entries(customerRevenue)
      .map(([name, value]) => ({ name, faturamento: value }))
      // FIX: Explicitly convert faturamento to a number to prevent type errors during arithmetic operation in sort.
      .sort((a, b) => Number(b.faturamento) - Number(a.faturamento));
  }, [projects]);
  
  const paymentMethodData = useMemo(() => {
    const paidRevenues = revenues.filter(r => r.status === PaymentStatus.PAID);
    const grouped = paidRevenues.reduce((acc, revenue) => {
        const method = revenue.paymentMethod || 'Não especificado';
        acc[method] = (acc[method] || 0) + revenue.value;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
  }, [revenues]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-stone-900/40 backdrop-blur-xl p-8 rounded-[2rem] border border-stone-800 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <PieChartIcon className="text-amber-500" size={24} />
                Gastos por Categoria
              </h3>
              <p className="text-sm text-stone-500 font-medium">Saídas pagas no mês selecionado</p>
            </div>
            <div className="flex items-center gap-2 bg-stone-900/40 border border-stone-800 p-2 rounded-2xl">
              <button onClick={() => changeExpenseMonth(-1)} className="p-2 hover:bg-stone-800 rounded-lg text-stone-500"><ChevronLeft /></button>
              <span className="font-bold text-base text-white w-40 text-center capitalize tabular-nums">
                {expenseDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
              </span>
              <button onClick={() => changeExpenseMonth(1)} className="p-2 hover:bg-stone-800 rounded-lg text-stone-500"><ChevronRight /></button>
            </div>
          </div>
          <div className="h-[400px]">
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={expenseData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={150} 
                    fill="#d97706" 
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                      if (percent === 0) return null;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                      const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                      return percent > 0.05 ? (<text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight="bold">
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>) : null;
                    }}
                  >
                      {expenseData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={CATEGORY_COLORS[entry.name] || '#a1a1aa'} />
                      ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#292524', borderRadius: '16px', border: '1px solid #44403c', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                    itemStyle={{ fontWeight: '600', color: '#fff' }}
                    formatter={(value: number) => formatCurrency(value)} 
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', fontWeight: '500', color: '#a8a29e' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-stone-600 gap-4">
                  <AlertCircle size={40} strokeWidth={1} />
                  <p className="text-sm font-medium italic">Sem saídas de caixa para este mês.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-stone-900/40 backdrop-blur-xl p-8 rounded-[2rem] border border-stone-800 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <Percent className="text-amber-500" size={24} />
                Margem de Lucro Real Anual
              </h3>
              <p className="text-sm text-stone-500 font-medium">Média de lucro dos projetos com pagamento concluído no ano.</p>
            </div>
            <div className="flex items-center gap-2 bg-stone-900/40 border border-stone-800 p-2 rounded-2xl">
              <button onClick={() => changeProfitYear(-1)} className="p-2 hover:bg-stone-800 rounded-lg text-stone-500"><ChevronLeft /></button>
              <span className="font-bold text-base text-white w-24 text-center tabular-nums">
                {profitYearDate.getFullYear()}
              </span>
              <button onClick={() => changeProfitYear(1)} className="p-2 hover:bg-stone-800 rounded-lg text-stone-500"><ChevronRight /></button>
            </div>
          </div>
          <div className="h-[400px] relative">
            {profitDataForYear.data.length > 0 ? (
              <>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-5xl font-black text-white tracking-tighter tabular-nums">{profitDataForYear.averageMargin.toFixed(1)}%</p>
                    <p className="text-sm font-bold text-stone-500 uppercase tracking-widest mt-1">Margem Real do Ano</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={profitDataForYear.data} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={120}
                      outerRadius={150} 
                      fill="#d97706" 
                      paddingAngle={2}
                      labelLine={false}
                      label={false}
                    >
                        <Cell key={`cell-margin`} fill={'#10b981'} />
                        <Cell key={`cell-cost`} fill={'#44403c'} />
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#292524', borderRadius: '16px', border: '1px solid #44403c', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                      itemStyle={{ fontWeight: '600', color: '#fff' }}
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Composição']} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-stone-600 gap-4">
                  <AlertCircle size={40} strokeWidth={1} />
                  <p className="text-sm font-medium italic">
                    {profitDataForYear.averageMargin < 0 ? `Margem real negativa de ${profitDataForYear.averageMargin.toFixed(1)}% no ano` : 'Sem projetos pagos para analisar neste ano.'}
                  </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-stone-900/40 backdrop-blur-xl p-8 rounded-[2rem] border border-stone-800 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <BarChart3 className="text-amber-500" size={24} />
                  Faturamento por Cliente
              </h3>
              <p className="text-sm text-stone-500 font-medium">Total de receitas pagas, agrupadas por cliente</p>
              </div>
          </div>
          <div className="h-[400px]">
            {revenueByCustomerData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByCustomerData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#292524" />
                  <XAxis dataKey="name" tick={{fill: '#a8a29e', fontSize: 12}} angle={-25} textAnchor="end" height={60} interval={0} />
                  <YAxis tick={{fill: '#a8a29e', fontSize: 12}} tickFormatter={(value) => formatCurrency(value as number)} />
                  <Tooltip 
                      contentStyle={{ backgroundColor: '#292524', borderRadius: '16px', border: '1px solid #44403c' }} 
                      formatter={(value: number) => [formatCurrency(value), 'Faturamento']} 
                      cursor={{ fill: '#292524' }}
                  />
                  <Bar dataKey="faturamento" fill="#d97706" radius={[4, 4, 0, 0]} />
                  </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-stone-600 gap-4">
                  <AlertCircle size={40} strokeWidth={1} />
                  <p className="text-sm font-medium italic">Sem projetos com status "Pago" para analisar.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-stone-900/40 backdrop-blur-xl p-8 rounded-[2rem] border border-stone-800 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <PieChartIcon className="text-amber-500" size={24} />
                    Receitas por Método de Pagamento
                </h3>
                <p className="text-sm text-stone-500 font-medium">Distribuição das entradas pagas</p>
              </div>
          </div>
          <div className="h-[400px]">
            {paymentMethodData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    fill="#8884d8"
                    labelLine={false}
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={MONTH_COLORS[index % MONTH_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#292524', borderRadius: '16px', border: '1px solid #44403c' }}
                    itemStyle={{ color: '#fff', fontWeight: '600' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', fontWeight: '500', color: '#a8a29e' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-stone-600 gap-4">
                <AlertCircle size={40} strokeWidth={1} />
                <p className="text-sm font-medium italic">Sem receitas pagas para analisar.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;