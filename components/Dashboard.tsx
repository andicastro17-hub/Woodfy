
import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ComposedChart,
  Line,
  BarChart as BarChart3Icon
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  ArrowDownRight,
  Hammer,
  Percent
} from 'lucide-react';
import { Project, Cost, Revenue, ProjectStatus, PaymentStatus, GeneralExpense } from '../types';
import { MANAGEMENT_TIPS } from '../constants';

interface DashboardProps {
  projects: Project[];
  costs: Cost[];
  revenues: Revenue[];
  expenses: GeneralExpense[];
}

const Dashboard: React.FC<DashboardProps> = ({ projects, costs, revenues, expenses }) => {
  
  const stats = useMemo(() => {
    const totalGrossRevenue = revenues
      .filter(r => r.status === PaymentStatus.PAID)
      .reduce((acc, r) => acc + Number(r.value || 0), 0);

    const totalProjectCosts = costs.reduce((acc, c) => acc + Number(c.value || 0), 0);
    const totalGeneralExpenses = expenses
      .filter(e => e.status === PaymentStatus.PAID)
      .reduce((acc, e) => acc + Number(e.value || 0), 0);

    const totalCosts = totalProjectCosts + totalGeneralExpenses;
    const netProfit = totalGrossRevenue - totalCosts;

    const realProfitMargin = totalGrossRevenue > 0 ? (netProfit / totalGrossRevenue) * 100 : 0;

    return { totalGrossRevenue, totalCosts, netProfit, avgMargin: realProfitMargin };
  }, [projects, costs, revenues, expenses]);

  const revenueVsCostData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d.toISOString().substring(0, 7);
    }).reverse();

    return last6Months.map(month => {
      const rev = revenues
        .filter(r => r.date.startsWith(month) && r.status === PaymentStatus.PAID)
        .reduce((acc, r) => acc + Number(r.value || 0), 0);
      
      const costProject = costs
        .filter(c => c.date.startsWith(month))
        .reduce((acc, c) => acc + Number(c.value || 0), 0);
        
      const exp = expenses
        .filter(e => e.dueDate.startsWith(month) && e.status === PaymentStatus.PAID)
        .reduce((acc, e) => acc + Number(e.value || 0), 0);

      const totalC = costProject + exp;

      return {
        name: new Date(month + '-02').toLocaleString('pt-BR', { month: 'short' }),
        faturamento: rev,
        custos: totalC,
        lucro: rev - totalC
      };
    });
  }, [revenues, costs, expenses]);

  const projectMargins = useMemo(() => {
    return projects
      .filter(p => p.status === ProjectStatus.FINISHED && p.valueSold > 0)
      .map(p => ({
        name: `${p.code} (${p.clientName})`,
        margem: Number(((p.valueSold - p.realCost) / p.valueSold * 100).toFixed(1))
      }))
      .sort((a, b) => b.margem - a.margem)
      .slice(0, 8);
  }, [projects]);

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HeroStatCard 
          label="Faturamento Real" 
          value={formatCurrency(stats.totalGrossRevenue)} 
          icon={DollarSign} 
          color="amber" 
          description="Total recebido em caixa"
        />
        <HeroStatCard 
          label="Lucro Líquido" 
          value={formatCurrency(stats.netProfit)} 
          icon={TrendingUp} 
          color="emerald" 
          description="Saldo final disponível"
        />
        <HeroStatCard 
          label="Saídas Totais" 
          value={formatCurrency(stats.totalCosts)} 
          icon={ArrowDownRight} 
          color="red" 
          description="Custos e despesas pagas"
        />
        <HeroStatCard 
          label="Margem Real" 
          value={`${stats.avgMargin.toFixed(1)}%`} 
          icon={Percent} 
          color="amber" 
          description="Lucro / Faturamento"
        />
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-stone-900/40 backdrop-blur-xl p-8 rounded-[2rem] border border-stone-800 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <BarChart3Icon className="text-amber-500" size={24} />
                Fluxo de Caixa Mensal
              </h3>
              <p className="text-sm text-stone-500 font-medium">Desempenho financeiro real dos últimos 6 meses</p>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={revenueVsCostData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#292524" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#78716c', fontSize: 12, fontWeight: 'medium'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#78716c', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1c1917', borderRadius: '16px', border: '1px solid #44403c', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                  itemStyle={{ fontWeight: '600', color: '#fff' }}
                  cursor={{ fill: '#292524' }}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '14px', fontWeight: '500' }} />
                <Bar dataKey="faturamento" name="Entradas" fill="#d97706" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="custos" name="Saídas" fill="#44403c" radius={[4, 4, 0, 0]} barSize={40} />
                <Line type="monotone" dataKey="lucro" name="Saldo" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-stone-900/40 backdrop-blur-xl p-8 rounded-[2rem] border border-stone-800">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <Percent className="text-amber-500" size={22} />
              Lucratividade por Projeto
            </h3>
            <span className="text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full uppercase tracking-widest">Finalizados</span>
          </div>
          <div className="h-[300px]">
            {projectMargins.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectMargins} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#292524" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={200} tick={{fill: '#78716c', fontWeight: 'bold', fontSize: 13}} />
                  <Tooltip 
                     formatter={(value: number) => [`${value}%`, 'Margem Real']}
                     contentStyle={{ backgroundColor: '#1c1917', borderRadius: '12px', border: '1px solid #44403c' }}
                  />
                  <Bar dataKey="margem" name="Margem" fill="#d97706" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-stone-600 space-y-4">
                <AlertCircle size={40} strokeWidth={1} />
                <p className="text-sm font-medium italic opacity-50">Sem projetos finalizados para análise.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-black p-10 rounded-[2rem] text-white flex flex-col items-center justify-center text-center relative overflow-hidden group border border-amber-500/10 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-700">
            <Hammer size={150} />
          </div>
          <span className="bg-amber-600/10 text-amber-500 px-5 py-2 rounded-full font-bold uppercase text-xs tracking-[0.3em] mb-8 border border-amber-600/20">
            Woodfinance Insight
          </span>
          <p className="text-2xl italic font-serif leading-relaxed relative z-10 text-stone-300 max-w-md">
            "{MANAGEMENT_TIPS[Math.floor(Math.random() * MANAGEMENT_TIPS.length)]}"
          </p>
        </div>
      </div>
    </div>
  );
};

const HeroStatCard: React.FC<{ label: string, value: string, icon: any, color: 'amber' | 'emerald' | 'red', description: string }> = ({ label, value, icon: Icon, color, description }) => {
  const themes = {
    amber: { 
      bg: 'bg-stone-900/60', 
      border: 'border-stone-800', 
      text: 'text-amber-500', 
      iconBg: 'bg-amber-500/10 text-amber-500',
    },
    emerald: { 
      bg: 'bg-stone-900/60', 
      border: 'border-stone-800', 
      text: 'text-emerald-500', 
      iconBg: 'bg-emerald-500/10 text-emerald-500',
    },
    red: { 
      bg: 'bg-stone-900/60', 
      border: 'border-stone-800', 
      text: 'text-rose-500', 
      iconBg: 'bg-rose-500/10 text-rose-500',
    },
  };

  const theme = themes[color];

  return (
    <div className={`${theme.bg} ${theme.border} p-8 rounded-[2rem] border transition-all hover:border-amber-500/30 hover:-translate-y-1 shadow-2xl`}>
      <div className="flex items-start justify-between mb-5">
        <div className={`p-4 rounded-2xl ${theme.iconBg}`}>
          <Icon size={24} strokeWidth={2} />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold text-stone-500 mb-1">{label}</p>
        <p className={`text-3xl font-black ${theme.text} tracking-tighter tabular-nums`}>{value}</p>
        <p className="text-xs text-stone-600 font-medium uppercase tracking-widest">{description}</p>
      </div>
    </div>
  );
};

export default Dashboard;
