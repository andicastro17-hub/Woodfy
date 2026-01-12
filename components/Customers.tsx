
import React, { useState } from 'react';
import { UserPlus, Search, Mail, Phone, MapPin, X, Trash2, Pencil, AlertTriangle, Users } from 'lucide-react';
import { Customer } from '../types';

interface CustomersProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

const Customers: React.FC<CustomersProps> = ({ customers, setCustomers }) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address
      });
    } else {
      setEditingCustomer(null);
      setFormData({ name: '', email: '', phone: '', address: '' });
    }
    setIsModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? { ...c, ...formData } : c));
    } else {
      const newCustomer: Customer = {
        id: crypto.randomUUID(),
        ...formData,
        totalSpent: 0,
        lastOrder: new Date().toISOString().split('T')[0]
      };
      setCustomers(prev => [...prev, newCustomer]);
    }
    setIsModalOpen(false);
  };

  const confirmDelete = () => {
    if (customerToDelete) {
      setCustomers(prev => prev.filter(c => c.id !== customerToDelete.id));
      setCustomerToDelete(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row items-center justify-between bg-stone-900/40 p-6 rounded-[2rem] border border-stone-800 gap-4 shadow-xl">
        <div className="relative flex-1 max-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome do cliente..." 
            className="w-full pl-12 pr-4 py-3.5 bg-stone-950 border border-stone-800 rounded-2xl outline-none focus:border-amber-500 transition-all text-sm font-medium" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="w-full md:w-auto bg-amber-600 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 hover:bg-amber-700 transition-all text-sm"
        >
          <UserPlus size={20} /> Cadastrar Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(c => (
          <div key={c.id} className="bg-stone-900/60 p-8 rounded-[2rem] border border-stone-800 shadow-xl hover:border-amber-500/30 transition-all group">
            <h4 className="font-bold text-lg text-white mb-1 truncate">{c.name}</h4>
            <div className="space-y-3 mt-6 text-sm text-stone-400 font-medium">
              <p className="flex items-center gap-3"><Mail size={16} className="text-stone-600" /> {c.email || 'E-mail não informado'}</p>
              <p className="flex items-center gap-3"><Phone size={16} className="text-stone-600" /> {c.phone || 'Telefone não informado'}</p>
              <p className="flex items-center gap-3"><MapPin size={16} className="text-stone-600" /> {c.address || 'Endereço não informado'}</p>
            </div>
            <div className="mt-8 pt-6 border-t border-stone-800 flex items-center justify-end gap-3">
              <button onClick={() => handleOpenModal(c)} className="p-2.5 text-stone-500 hover:text-amber-500 hover:bg-amber-500/5 rounded-xl transition-all"><Pencil size={18} /></button>
              <button onClick={() => setCustomerToDelete(c)} className="p-2.5 text-stone-500 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-stone-600 gap-4">
            <Users size={60} strokeWidth={1} />
            <p className="text-sm font-bold uppercase tracking-widest opacity-50">Nenhum cliente encontrado</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-stone-900 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-stone-800 animate-in zoom-in duration-300">
            <div className="p-8 border-b border-stone-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white tracking-tight">
                {editingCustomer ? 'Editar Informações' : 'Cadastrar Novo Cliente'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-500 hover:text-white p-2 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveCustomer} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Nome Completo</label>
                <input required placeholder="Ex: João da Silva" className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-200 outline-none focus:border-amber-500 font-medium" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">E-mail</label>
                  <input type="email" placeholder="cliente@email.com" className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-200 outline-none focus:border-amber-500 font-medium" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Telefone</label>
                  <input placeholder="(00) 00000-0000" className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-200 outline-none focus:border-amber-500 font-medium" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Endereço</label>
                <input placeholder="Rua, Número, Bairro, Cidade" className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-200 outline-none focus:border-amber-500 font-medium" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="pt-8 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-stone-500 font-bold text-sm hover:text-stone-300 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 bg-amber-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-amber-600/20 hover:bg-amber-700 transition-all text-sm">
                  {editingCustomer ? 'Salvar Alterações' : 'Salvar Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {customerToDelete && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-stone-900 rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl border border-rose-900/20 animate-in zoom-in duration-200">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Remover Cliente?</h3>
              <p className="text-stone-500 text-sm leading-relaxed font-medium">
                Você está prestes a remover <strong>{customerToDelete.name}</strong>. Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="p-6 bg-black/40 flex flex-col gap-3">
              <button onClick={confirmDelete} className="w-full bg-rose-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all">
                Remover Definitivamente
              </button>
              <button onClick={() => setCustomerToDelete(null)} className="w-full bg-stone-800 text-stone-400 py-3.5 rounded-2xl font-bold text-sm hover:text-stone-300">
                Manter Cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;