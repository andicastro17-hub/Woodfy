
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
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Briefcase,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Project, Cost, Revenue, ProjectStatus, PaymentStatus, GeneralExpense } from '../types';

interface DashboardProps {
  projects: Project[];
  costs: Cost[];
  revenues: Revenue[];
  // Added expenses to fix App.tsx error
  expenses: GeneralExpense[];
}

const COLORS = ['#065f46', '#b45309', '#44403c', '#0f172a'];

const Dashboard: React.FC<DashboardProps> = ({ projects, costs, revenues, expenses }) => {
  const stats = useMemo(() => {
    const totalRev = revenues.filter(r => r.status === PaymentStatus.PAID).reduce((acc, r) => acc + r.value, 0);
    const totalCst = costs.reduce((acc, c) => acc + c.value, 0);
    const totalProf = totalRev - totalCst;
    
    const finishedProjects = projects.filter(p => p.status === ProjectStatus.FINISHED);
    const avgMargin = finishedProjects.length > 0
      ? finishedProjects.reduce((acc, p) => acc + ((p.valueSold - p.realCost) / p.valueSold), 0) / finishedProjects.length
      : 0;

    const delayed = projects.filter(p => p.status === ProjectStatus.DELAYED).length;

    return { totalRev, totalCst, totalProf, avgMargin, delayed };
  }, [projects, costs, revenues]);

  const costDistribution = useMemo(() => {
    const data: Record<string, number> = {};
    costs.forEach(c => {
      data[c.category] = (data[c.category] || 0) + c.value;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [costs]);

  const projectsComparison = useMemo(() => {
    return projects.slice(-6).map(p => ({
      name: p.code,
      estimado: p.estimatedCost,
      real: p.realCost
    }));
  }, [projects]);

  const profitByProject = useMemo(() => {
    return projects.slice(-6).map(p => ({
      name: p.code,
      lucro: p.valueSold - p.realCost
    }));
  }, [projects]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
          label="Faturamento Total" 
          value={formatCurrency(stats.totalRev)} 
          icon={DollarSign} 
          color="emerald"
          trend="+12% vs mês anterior"
        />
        <StatCard 
          label="Custo Acumulado" 
          value={formatCurrency(stats.totalCst)} 
          icon={ArrowDownRight} 
          color="stone"
          trend="Dentro do esperado"
        />
        <StatCard 
          label="Lucro Líquido" 
          value={formatCurrency(stats.totalProf)} 
          icon={TrendingUp} 
          color="amber"
          trend="8.5% margem média"
        />
        <StatCard 
          label="Margem Média" 
          value={`${(stats.avgMargin * 100).toFixed(1)}%`} 
          icon={Briefcase} 
          color="emerald"
          trend="Ideal: 35%"
        />
        <StatCard 
          label="Projetos Atrasados" 
          value={stats.delayed.toString()} 
          icon={AlertCircle} 
          color={stats.delayed > 0 ? 'red' : 'emerald'}
          trend={stats.delayed > 0 ? "Ação requerida!" : "Tudo em dia"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cost vs Estimate Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-stone-800">Custo Estimado vs Real (Últimos Projetos)</h3>
            <span className="text-xs font-semibold px-2 py-1 bg-amber-50 text-amber-700 rounded uppercase">Visualização Analítica</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectsComparison}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#fcfcfc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" verticalAlign="top" align="right" />
                <Bar dataKey="estimado" name="Estimado" fill="#d6d3d1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="real" name="Real" fill="#b45309" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Distribution Pie */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <h3 className="text-lg font-bold text-stone-800 mb-6">Distribuição de Custos</h3>
          <div className="h-[300px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {costDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
           <h3 className="text-lg font-bold text-stone-800 mb-6">Lucro por Projeto</h3>
           <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={profitByProject}>
                <defs>
                  <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#065f46" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#065f46" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="lucro" name="Lucro" stroke="#065f46" fillOpacity={1} fill="url(#colorLucro)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
           </div>
        </div>
        
        <div className="bg-stone-900 p-6 rounded-2xl text-white flex flex-col justify-center">
            <h4 className="text-amber-500 font-bold uppercase text-xs tracking-widest mb-4">Dica de Gestão</h4>
            <p className="text-stone-300 italic text-sm leading-relaxed">
              "Fique atento aos custos variáveis (terceiros e transporte). Em marcenarias, eles são os maiores responsáveis por diminuir a margem de lucro real."
            </p>
            <div className="mt-8 pt-8 border-t border-stone-800">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-stone-400">Eficiência Financeira</span>
                    <span className="text-xs font-bold text-emerald-400">78%</span>
                </div>
                <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[78%]"></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string, icon: any, color: string, trend: string }> = ({ label, value, icon: Icon, color, trend }) => {
  const colorClasses: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700',
    stone: 'bg-stone-100 text-stone-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
  };

  const iconClasses: Record<string, string> = {
    emerald: 'bg-emerald-600',
    stone: 'bg-stone-800',
    amber: 'bg-amber-600',
    red: 'bg-red-600',
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2 rounded-xl ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${colorClasses[color]}`}>
          {color === 'red' ? 'Atenção' : 'Ativo'}
        </span>
      </div>
      <div>
        <p className="text-sm font-medium text-stone-500 mb-1">{label}</p>
        <p className="text-2xl font-bold text-stone-900 tracking-tight">{value}</p>
        <p className={`mt-2 text-[11px] font-semibold flex items-center gap-1 ${color === 'red' ? 'text-red-600' : 'text-stone-400'}`}>
          {trend}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
