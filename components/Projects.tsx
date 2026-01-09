
import React, { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, AlertCircle, CheckCircle } from 'lucide-react';
import { Project, ProjectStatus, PaymentStatus, Customer } from '../types';
import { FURNITURE_TYPES } from '../constants';

interface ProjectsProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  // Added customers to fix App.tsx error
  customers: Customer[];
}

const Projects: React.FC<ProjectsProps> = ({ projects, setProjects, customers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    code: `PROJ-${(projects.length + 1).toString().padStart(3, '0')}`,
    status: ProjectStatus.IN_PROGRESS,
    paymentStatus: PaymentStatus.PENDING,
    valueSold: 0,
    estimatedCost: 0,
    realCost: 0
  });

  // Fixed: changed p.client to p.clientName
  const filteredProjects = projects.filter(p => 
    p.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    const project: Project = {
      ...newProject,
      id: Date.now().toString(),
      // Adding dummy clientId if not set
      clientId: newProject.clientId || 'cust1',
    } as Project;
    setProjects([...projects, project]);
    setIsModalOpen(false);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
      <div className="p-6 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por cliente ou código..."
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors">
            <Filter size={18} />
          </button>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-stone-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-stone-800 transition-colors"
        >
          <Plus size={20} />
          Novo Projeto
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-stone-50 text-stone-500 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Código / Cliente</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Valor Vendido</th>
              <th className="px-6 py-4">Custos (Est. vs Real)</th>
              <th className="px-6 py-4">Lucro / Margem</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Pagamento</th>
              <th className="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredProjects.map(p => {
              const profit = p.valueSold - p.realCost;
              const margin = p.valueSold > 0 ? (profit / p.valueSold) * 100 : 0;
              const isOverCost = p.realCost > p.estimatedCost;

              return (
                <tr key={p.id} className="hover:bg-stone-50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-stone-800">{p.code}</p>
                    {/* Fixed: changed p.client to p.clientName */}
                    <p className="text-sm text-stone-500">{p.clientName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm px-2 py-1 bg-stone-100 text-stone-600 rounded-md font-medium">
                      {p.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-stone-800">
                    {formatCurrency(p.valueSold)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-stone-400">Est: {formatCurrency(p.estimatedCost)}</span>
                      <span className={`text-sm font-bold ${isOverCost ? 'text-red-600 flex items-center gap-1' : 'text-emerald-700'}`}>
                        {formatCurrency(p.realCost)}
                        {isOverCost && <AlertCircle size={14} />}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold ${profit >= 0 ? 'text-stone-800' : 'text-red-600'}`}>
                        {formatCurrency(profit)}
                      </span>
                      <span className="text-xs text-stone-400">{margin.toFixed(1)}% margem</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    {p.paymentStatus === PaymentStatus.PAID ? (
                      <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs uppercase">
                        <CheckCircle size={14} /> Pago
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-amber-600 font-bold text-xs uppercase">
                        <AlertCircle size={14} /> Pendente
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-stone-400 hover:text-stone-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-stone-800">Novo Projeto</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-stone-400" /></button>
            </div>
            <form onSubmit={handleAddProject} className="p-6 grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-500 uppercase">Código</label>
                <input required className="w-full border rounded-lg p-2" value={newProject.code} onChange={e => setNewProject({...newProject, code: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-500 uppercase">Cliente</label>
                {/* Fixed: changed client to clientName */}
                <input required className="w-full border rounded-lg p-2" placeholder="Nome completo" value={newProject.clientName || ''} onChange={e => setNewProject({...newProject, clientName: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-500 uppercase">Tipo de Móvel</label>
                <select className="w-full border rounded-lg p-2" onChange={e => setNewProject({...newProject, type: e.target.value})}>
                  {FURNITURE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-500 uppercase">Valor de Venda (R$)</label>
                <input type="number" required className="w-full border rounded-lg p-2" onChange={e => setNewProject({...newProject, valueSold: Number(e.target.value)})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-500 uppercase">Custo Estimado (R$)</label>
                <input type="number" className="w-full border rounded-lg p-2" onChange={e => setNewProject({...newProject, estimatedCost: Number(e.target.value)})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-500 uppercase">Status Inicial</label>
                <select className="w-full border rounded-lg p-2" onChange={e => setNewProject({...newProject, status: e.target.value as ProjectStatus})}>
                  <option value={ProjectStatus.IN_PROGRESS}>Em andamento</option>
                  <option value={ProjectStatus.FINISHED}>Finalizado</option>
                  <option value={ProjectStatus.DELAYED}>Atrasado</option>
                </select>
              </div>
              <div className="col-span-2 pt-6 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 border py-2 rounded-lg font-bold hover:bg-stone-50">Cancelar</button>
                <button type="submit" className="flex-1 bg-amber-700 text-white py-2 rounded-lg font-bold hover:bg-amber-800">Salvar Projeto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const X = ({size, className}: {size: number, className?: string}) => <Plus size={size} className={`${className} rotate-45`} />;

const StatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  const styles = {
    [ProjectStatus.IN_PROGRESS]: 'bg-blue-50 text-blue-600',
    [ProjectStatus.FINISHED]: 'bg-emerald-50 text-emerald-600',
    [ProjectStatus.DELAYED]: 'bg-red-50 text-red-600',
  };

  return (
    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${styles[status]}`}>
      {status}
    </span>
  );
};

export default Projects;
