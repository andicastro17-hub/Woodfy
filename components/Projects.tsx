
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Filter, Pencil, X, Briefcase, Trash2, MoreVertical, AlertTriangle, DollarSign, Tag, TrendingUp, BarChart3, ListTodo, CheckCircle2, Clock, AlertCircle, ChevronDown, Calendar, Percent } from 'lucide-react';
import { Project, ProjectStatus, PaymentStatus, Customer, Budget, Cost } from '../types';
import { FURNITURE_TYPES } from '../constants';

interface ProjectsProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  customers: Customer[];
  budgets: Budget[];
  costs: Cost[];
  handleDeleteProject: (id: string) => void;
}

const Projects: React.FC<ProjectsProps> = ({ projects, setProjects, customers, budgets, costs, handleDeleteProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectStatus>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [manualClientName, setManualClientName] = useState('');
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({});
  const [isBudgetLoaded, setIsBudgetLoaded] = useState(false);

  const isEditing = !!currentProject.id;

  useEffect(() => {
    // This effect handles auto-population from approved budgets and locks fields.
    // It applies to both new and existing projects to enforce data consistency.
    if (currentProject.clientId && currentProject.clientId !== 'outros') {
        const approvedBudgets = budgets.filter(b => b.customerId === currentProject.clientId && b.status === 'Aprovado');
        
        if (approvedBudgets.length > 0) {
            // If an approved budget exists, it's the source of truth. Populate and lock.
            const latestBudget = approvedBudgets.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
            setCurrentProject(prev => ({
                ...prev,
                valueSold: latestBudget.finalPrice,
                estimatedCost: latestBudget.totalCost,
            }));
            setIsBudgetLoaded(true);
        } else {
            // No approved budget. Unlock fields.
            setIsBudgetLoaded(false);
            // If it's a NEW project, clear fields to avoid carrying over data from a previously selected customer.
            if (!isEditing) {
               setCurrentProject(prev => ({ ...prev, valueSold: undefined, estimatedCost: undefined }));
            }
        }
    } else {
        // No customer or "Cliente Avulso". Unlock fields.
        setIsBudgetLoaded(false);
        // If it's a NEW project, clear fields.
        if (!isEditing) {
            setCurrentProject(prev => ({ ...prev, valueSold: undefined, estimatedCost: undefined }));
        }
    }
  }, [currentProject.clientId, budgets, isEditing]);


  const filteredProjects = useMemo(() => {
    return projects
      .filter(p => 
        p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .filter(p => statusFilter === 'all' || p.status === statusFilter);
  }, [projects, searchTerm, statusFilter]);

  const totalProfit = useMemo(() => {
    return filteredProjects.reduce((acc, p) => acc + (Number(p.valueSold || 0) - Number(p.estimatedCost || 0)), 0);
  }, [filteredProjects]);

  const averageTicket = useMemo(() => {
    return filteredProjects.length > 0 
      ? (filteredProjects.reduce((acc, p) => acc + Number(p.valueSold || 0), 0) / filteredProjects.length) 
      : 0;
  }, [filteredProjects]);

  const handleOpenModal = (project?: Project) => {
    setOpenMenuId(null);
    if (project) {
      setCurrentProject(project);
      setManualClientName(project.clientId === 'outros' ? project.clientName : '');
    } else {
      setCurrentProject({
        status: ProjectStatus.IN_PROGRESS,
        paymentStatus: PaymentStatus.PENDING,
        startDate: new Date().toISOString().split('T')[0],
        deliveryDate: '',
        code: `P${(projects.length + 1).toString().padStart(3, '0')}`,
        type: FURNITURE_TYPES[0],
        clientId: '',
        description: '',
      });
      setManualClientName('');
    }
    setIsModalOpen(true);
  };
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject.clientId) return;

    let finalClientName = '';
    if (currentProject.clientId === 'outros') {
      finalClientName = manualClientName || 'Cliente Avulso';
    } else {
      const customer = customers.find(c => c.id === currentProject.clientId);
      finalClientName = customer?.name || 'Desconhecido';
    }

    if (isEditing) {
      setProjects(prev => prev.map(p => p.id === currentProject.id ? { ...currentProject, clientName: finalClientName } as Project : p));
    } else {
      const projectToAdd: Project = { id: crypto.randomUUID(), clientName: finalClientName, ...currentProject } as Project;
      setProjects(prev => [...prev, projectToAdd]);
    }
    setIsModalOpen(false);
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-8 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Lucro Estimado" value={formatCurrency(totalProfit)} icon={TrendingUp} color="amber" />
        <StatCard label="Ticket Médio" value={formatCurrency(averageTicket)} icon={BarChart3} color="stone" />
        <StatCard label="Orçamentos" value={filteredProjects.length.toString()} icon={ListTodo} color="stone" />
      </div>

      <div className="bg-stone-900/60 p-5 rounded-[2rem] border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={18} />
            <input type="text" placeholder="Localizar cliente ou projeto..." className="w-full pl-12 pr-4 py-3 bg-stone-950 border border-stone-800 rounded-2xl focus:border-amber-500 outline-none transition-all placeholder:text-stone-700 text-sm font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center gap-1 p-1 bg-stone-950 rounded-2xl border border-stone-800">
            <FilterButton label="Todos" isActive={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
            <FilterButton label="Ativos" isActive={statusFilter === ProjectStatus.IN_PROGRESS} onClick={() => setStatusFilter(ProjectStatus.IN_PROGRESS)} />
            <FilterButton label="Finalizados" isActive={statusFilter === ProjectStatus.FINISHED} onClick={() => setStatusFilter(ProjectStatus.FINISHED)} />
          </div>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center justify-center gap-2 bg-amber-600 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 text-xs uppercase tracking-widest">
          <Plus size={18} strokeWidth={3} /> Lançar Projeto
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredProjects.map(p => (
          <ProjectCard 
            key={p.id} 
            project={p} 
            formatCurrency={formatCurrency} 
            setProjectToDelete={setProjectToDelete} 
            openMenuId={openMenuId} 
            setOpenMenuId={setOpenMenuId} 
            onEdit={handleOpenModal} 
            onStatusUpdate={(id, field, value) => setProjects(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))}
          />
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-stone-900 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-stone-800 animate-in zoom-in duration-300">
            <div className="p-8 border-b border-stone-800 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-black text-amber-500 uppercase tracking-[0.3em]">Editor de Lançamentos</p>
                <h3 className="text-2xl font-bold text-white">{isEditing ? 'Configurar Projeto' : 'Registrar Venda'}</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-stone-800 rounded-full text-stone-500 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSave} className="p-10 space-y-8 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-widest ml-1">Cliente do Projeto</label>
                    <select required className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 focus:border-amber-500 outline-none transition-all text-sm font-medium" value={currentProject.clientId || ''} onChange={e => setCurrentProject({...currentProject, clientId: e.target.value})}>
                      <option value="">Localizar cliente no catálogo...</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      <option value="outros">Cliente Avulso (Inserção Manual)</option>
                    </select>
                    {currentProject.clientId === 'outros' && (
                      <input type="text" required placeholder="Nome do cliente avulso..." className="w-full bg-stone-950 border border-amber-900/50 rounded-2xl p-4 focus:border-amber-500 outline-none mt-4 text-sm font-bold animate-in slide-in-from-top-4" value={manualClientName} onChange={e => setManualClientName(e.target.value)} />
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-widest ml-1">Código Identificador</label>
                    <input type="text" className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 focus:border-amber-500 outline-none text-sm font-bold" value={currentProject.code || ''} onChange={e => setCurrentProject({...currentProject, code: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-widest ml-1">Tipologia de Móvel</label>
                    <select className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 focus:border-amber-500 outline-none text-sm font-bold" value={currentProject.type || ''} onChange={e => setCurrentProject({...currentProject, type: e.target.value})}>
                      {FURNITURE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-widest ml-1">Descrição Técnica (MDF, Ferragens, Detalhes)</label>
                    <textarea 
                      rows={3}
                      className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 focus:border-amber-500 outline-none text-sm font-medium text-stone-300 resize-none" 
                      placeholder="Ex: MDF Guararapes Louro Freijó, Dobradiças com amortecimento, Puxadores perfil alumínio preto..."
                      value={currentProject.description || ''} 
                      onChange={e => setCurrentProject({...currentProject, description: e.target.value})} 
                    />
                </div>

                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-stone-800">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-widest ml-1">Data de Início</label>
                    <input type="date" className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 focus:border-amber-500 outline-none text-sm font-bold text-stone-300" value={currentProject.startDate || ''} onChange={e => setCurrentProject({...currentProject, startDate: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-widest ml-1">Previsão de Entrega</label>
                    <input type="date" className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 focus:border-amber-500 outline-none text-sm font-bold text-stone-300" value={currentProject.deliveryDate || ''} onChange={e => setCurrentProject({...currentProject, deliveryDate: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-stone-800">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-widest ml-1">Valor do Fechamento (R$)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      required 
                      className={`w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 outline-none font-black transition-all ${
                        isBudgetLoaded 
                        ? 'text-stone-500 cursor-not-allowed' 
                        : 'text-emerald-500 focus:border-emerald-500'
                      }`}
                      value={currentProject.valueSold || ''} 
                      onChange={e => setCurrentProject({...currentProject, valueSold: Number(e.target.value)})} 
                      readOnly={isBudgetLoaded}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-stone-500 uppercase tracking-widest ml-1">Custo Projetado (R$)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className={`w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 outline-none font-black transition-all ${
                        isBudgetLoaded 
                        ? 'text-stone-500 cursor-not-allowed' 
                        : 'text-rose-500 focus:border-rose-500'
                      }`}
                      value={currentProject.estimatedCost || ''} 
                      onChange={e => setCurrentProject({...currentProject, estimatedCost: Number(e.target.value)})} 
                      readOnly={isBudgetLoaded}
                    />
                  </div>
                </div>
                 {isBudgetLoaded && (
                    <p className="text-center text-xs text-amber-600/80 font-bold -mt-4 animate-in fade-in">
                        Valores carregados do orçamento aprovado mais recente.
                    </p>
                )}

                <div className="pt-8 flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-stone-500 uppercase text-xs tracking-widest hover:text-white transition-colors">Descartar</button>
                  <button type="submit" className="flex-1 bg-amber-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-amber-600/20 hover:bg-amber-700 transition-all uppercase text-xs tracking-widest">
                    {isEditing ? 'Confirmar Atualização' : 'Efetivar Lançamento'}
                  </button>
                </div>
            </form>
          </div>
        </div>
      )}
      
      {projectToDelete && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
          <div className="bg-stone-900 rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl border border-rose-900/20 animate-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20 shadow-glow-red">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Apagar Projeto?</h3>
              <p className="text-stone-500 text-sm font-medium leading-relaxed">
                Esta ação removerá permanentemente o histórico de vendas e custos deste projeto.
              </p>
            </div>
            <div className="p-6 bg-black/40 flex flex-col gap-3">
              <button onClick={() => { handleDeleteProject(projectToDelete); setProjectToDelete(null); }} className="w-full bg-rose-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all">
                Apagar Definitivamente
              </button>
              <button onClick={() => setProjectToDelete(null)} className="w-full bg-stone-800 text-stone-400 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-stone-700 transition-all">
                Manter Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProjectCard: React.FC<{
    project: Project;
    formatCurrency: (val: number) => string;
    setProjectToDelete: (id: string) => void;
    openMenuId: string | null;
    setOpenMenuId: (id: string | null) => void;
    onEdit: (proj: Project) => void;
    onStatusUpdate: (id: string, field: 'status' | 'paymentStatus', value: any) => void;
}> = ({ project: p, formatCurrency, setProjectToDelete, openMenuId, setOpenMenuId, onEdit, onStatusUpdate }) => {
    const profit = p.valueSold - (p.estimatedCost || 0);

    return (
        <div className="bg-stone-900/60 rounded-[2rem] border border-stone-800 p-8 flex flex-col group relative hover:border-amber-600/30 transition-all shadow-xl hover:shadow-2xl">
            {/* --- TOP ROW: Badges and Menu --- */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex flex-wrap gap-2">
                    <Badge status={p.status} onUpdate={(val) => onStatusUpdate(p.id, 'status', val)} options={Object.values(ProjectStatus)} color="amber" />
                    <Badge status={p.paymentStatus} onUpdate={(val) => onStatusUpdate(p.id, 'paymentStatus', val)} options={Object.values(PaymentStatus)} color="emerald" />
                </div>
                <div className="relative z-20">
                    <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === p.id ? null : p.id); }} className="p-2 rounded-full text-stone-600 hover:bg-stone-800 transition-colors">
                        <MoreVertical size={20} />
                    </button>
                    {openMenuId === p.id && (
                        <div className="absolute right-0 mt-2 w-44 bg-stone-900 border border-stone-800 rounded-xl shadow-2xl z-30 overflow-hidden py-1">
                            <button onClick={() => onEdit(p)} className="w-full px-4 py-2 text-left text-[11px] font-black uppercase tracking-widest text-stone-400 hover:bg-stone-800 hover:text-white flex items-center gap-2 transition-all"><Pencil size={12} /> Editar</button>
                            <button onClick={() => { setProjectToDelete(p.id); setOpenMenuId(null); }} className="w-full px-4 py-2 text-left text-[11px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 flex items-center gap-2 transition-all"><Trash2 size={12} /> Apagar</button>
                        </div>
                    )}
                </div>
            </div>
            
            {/* --- MAIN INFO BLOCK --- */}
            <div className="flex-1 mb-6">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">{p.code}</p>
                <p className="font-black text-2xl text-white tracking-tighter mt-1 truncate">{p.clientName}</p>
                <p className="text-lg font-bold text-amber-500 mb-4">{p.type}</p>
                 {p.description && (
                    <p className="text-sm text-stone-400 font-medium line-clamp-3 leading-relaxed">
                        {p.description}
                    </p>
                )}
            </div>

            {/* --- DATES (Simplified) --- */}
            <div className="flex justify-between items-center text-xs text-stone-500 font-medium border-y border-stone-800/50 py-4 my-6">
                <div className="flex items-center gap-3">
                    <Calendar size={16} className="text-stone-600"/>
                    <div>
                        <p className="text-[11px] text-stone-600 uppercase font-black tracking-widest">Início</p>
                        <p className="font-bold text-stone-300 text-base tabular-nums">{new Date(p.startDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                    <div>
                        <p className="text-[11px] text-stone-600 uppercase font-black tracking-widest">Entrega</p>
                        <p className="font-bold text-stone-300 text-base tabular-nums">{p.deliveryDate ? new Date(p.deliveryDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'A definir'}</p>
                    </div>
                </div>
            </div>

            {/* --- FINANCIALS (Unchanged) --- */}
            <div className="grid grid-cols-3 gap-6 text-center">
                <Metric label="Venda" value={formatCurrency(p.valueSold)} color="white" />
                <Metric label="Custo" value={formatCurrency(p.estimatedCost || 0)} color="rose" />
                <Metric label="Lucro" value={formatCurrency(profit)} color="emerald" />
            </div>
        </div>
    )
}

const Badge: React.FC<{ status: string, onUpdate: (v: any) => void, options: string[], color: string }> = ({ status, onUpdate, options, color }) => (
  <div className="relative">
    <span className={`bg-stone-950 border border-stone-800 text-stone-400 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:border-amber-500 transition-all cursor-pointer`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === ProjectStatus.FINISHED || status === PaymentStatus.PAID ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
      {status} <ChevronDown size={10} />
    </span>
    <select className="absolute inset-0 opacity-0 cursor-pointer w-full" value={status} onChange={(e) => onUpdate(e.target.value)}>
      {options.map(s => <option key={s} value={s}>{s}</option>)}
    </select>
  </div>
);

const Metric: React.FC<{ label: string, value: string, color: 'white' | 'rose' | 'emerald' }> = ({ label, value, color }) => {
  const colors = {
    white: 'text-stone-300',
    rose: 'text-rose-500',
    emerald: 'text-emerald-500'
  };
  return (
    <div>
      <label className="text-[11px] text-stone-600 uppercase font-black tracking-widest block mb-1">{label}</label>
      <p className={`font-black ${colors[color]} text-base tabular-nums`}>{value}</p>
    </div>
  );
};

const FilterButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button type="button" onClick={onClick} className={`px-5 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${isActive ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'text-stone-600 hover:text-stone-400'}`}>
        {label}
    </button>
);

const StatCard: React.FC<{ label: string, value: string, icon: any, color: 'amber' | 'stone' }> = ({ label, value, icon: Icon, color }) => {
  const themes = {
    amber: 'bg-stone-900 border-amber-900/20 text-amber-500',
    stone: 'bg-stone-900 border-stone-800 text-stone-300',
  };
  return (
    <div className={`p-6 rounded-[2rem] border-2 ${themes[color]} shadow-2xl`}>
        <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] opacity-60">{label}</p>
            <Icon size={18} className="opacity-40" />
        </div>
        <p className="text-2xl font-black tracking-tighter tabular-nums">{value}</p>
    </div>
  );
};

export default Projects;
