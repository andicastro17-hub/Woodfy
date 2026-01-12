
import React, { useState } from 'react';
import { Truck, Star, Phone, Plus, Trash2, MoreVertical, Pencil, AlertTriangle, X, Mail } from 'lucide-react';
import { Supplier } from '../types';
import { SUPPLIER_CATEGORIES } from '../constants';

interface SuppliersProps {
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
}

const Suppliers: React.FC<SuppliersProps> = ({ suppliers, setSuppliers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);
  const [currentSupplier, setCurrentSupplier] = useState<Partial<Supplier>>({
    name: '', category: 'MDF', phone: '', email: '', rating: 3,
  });

  const isEditing = !!currentSupplier.id;

  const handleOpenModal = (supplier?: Supplier) => {
    if (supplier) {
      setCurrentSupplier(supplier);
    } else {
      setCurrentSupplier({ name: '', category: 'MDF', phone: '', email: '', rating: 3 });
    }
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentSupplier({ name: '', category: 'MDF', phone: '', email: '', rating: 3 });
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSupplier.name || !currentSupplier.category) return;

    if (isEditing) {
      setSuppliers(prev => prev.map(s => s.id === currentSupplier.id ? (currentSupplier as Supplier) : s));
    } else {
      const supplierToAdd: Supplier = {
        id: crypto.randomUUID(),
        name: currentSupplier.name,
        category: currentSupplier.category,
        phone: currentSupplier.phone || '',
        email: currentSupplier.email || '',
        rating: currentSupplier.rating || 3,
      };
      setSuppliers(prev => [...prev, supplierToAdd]);
    }
    handleCloseModal();
  };

  const confirmDelete = () => {
    if (supplierToDelete) {
      setSuppliers(prev => prev.filter(s => s.id !== supplierToDelete));
      setSupplierToDelete(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {openMenuId && <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />}

      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-white tracking-tight">Rede de Fornecedores</h3>
          <p className="text-stone-500 text-sm font-medium">Central de parceiros para compra de materiais e ferragens.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="w-full md:w-auto bg-amber-600 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20 hover:bg-amber-700 transition-all text-sm"
        >
          <Plus size={20} /> Adicionar Fornecedor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {suppliers.map(s => (
          <div key={s.id} className="bg-stone-900/60 p-6 rounded-[2rem] border border-stone-800 shadow-xl relative group hover:border-amber-500/30 transition-all shadow-xl">
            <div className="absolute top-6 right-6 z-20">
               <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === s.id ? null : s.id); }} className="p-2 rounded-full text-stone-600 hover:bg-stone-800 transition-colors">
                <MoreVertical size={18} />
              </button>
              {openMenuId === s.id && (
                <div className="absolute right-0 mt-2 w-44 bg-stone-900 border border-stone-800 rounded-xl shadow-2xl z-30 overflow-hidden py-1">
                  <button onClick={() => handleOpenModal(s)} className="w-full px-4 py-2 text-left text-xs font-bold uppercase tracking-widest text-stone-400 hover:bg-stone-800 hover:text-white flex items-center gap-2 transition-all"><Pencil size={12} /> Editar</button>
                  <button onClick={() => { setSupplierToDelete(s.id); setOpenMenuId(null); }} className="w-full px-4 py-2 text-left text-xs font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 flex items-center gap-2 transition-all"><Trash2 size={12} /> Apagar</button>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mb-5 pr-6">
              <div className="p-3 bg-stone-950 rounded-xl text-stone-500 group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-all shadow-inner border border-stone-800">
                <Truck size={22} />
              </div>
              <div className="flex gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < s.rating ? 'currentColor' : 'none'} strokeWidth={2} />
                ))}
              </div>
            </div>
            <h4 className="font-bold text-white truncate pr-6 text-base leading-tight tracking-tight">{s.name}</h4>
            <span className="inline-block mt-3 px-3 py-1 bg-stone-950 text-stone-500 text-xs font-bold rounded-lg border border-stone-800 uppercase tracking-widest">
              {s.category}
            </span>
            <div className="mt-6 pt-5 border-t border-stone-800 text-sm font-medium text-stone-500 space-y-2">
              <span className="flex items-center gap-2">
                <Phone size={14} className="text-stone-700" /> {s.phone || 'Não informado'}
              </span>
              <span className="flex items-center gap-2">
                <Mail size={14} className="text-stone-700" /> {s.email || 'Não informado'}
              </span>
            </div>
          </div>
        ))}
        {suppliers.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-stone-600 gap-4">
            <Truck size={60} strokeWidth={1} />
            <p className="text-sm font-bold uppercase tracking-widest opacity-50">Nenhum fornecedor registrado</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-stone-900 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-stone-800 animate-in zoom-in duration-300">
            <div className="p-8 border-b border-stone-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white tracking-tight">{isEditing ? 'Editar Parceiro' : 'Novo Fornecedor'}</h3>
              <button onClick={handleCloseModal} className="text-stone-500 hover:text-white p-2 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveSupplier} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Nome da Empresa</label>
                <input required className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-200 outline-none focus:border-amber-500 font-medium" value={currentSupplier.name || ''} onChange={e => setCurrentSupplier({...currentSupplier, name: e.target.value})} placeholder="Ex: Madeiras Brasil S.A." />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Categoria</label>
                  <select className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-200 outline-none focus:border-amber-500 font-medium" value={currentSupplier.category} onChange={e => setCurrentSupplier({...currentSupplier, category: e.target.value as Supplier['category']})}>
                    {SUPPLIER_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Avaliação (1 a 5)</label>
                  <input type="number" min="1" max="5" className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-200 outline-none focus:border-amber-500 font-medium" value={currentSupplier.rating || ''} onChange={e => setCurrentSupplier({...currentSupplier, rating: Number(e.target.value)})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Telefone / WhatsApp</label>
                  <input className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-200 outline-none focus:border-amber-500 font-medium" value={currentSupplier.phone || ''} onChange={e => setCurrentSupplier({...currentSupplier, phone: e.target.value})} placeholder="Ex: (11) 99999-9999" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">E-mail</label>
                  <input type="email" className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-stone-200 outline-none focus:border-amber-500 font-medium" value={currentSupplier.email || ''} onChange={e => setCurrentSupplier({...currentSupplier, email: e.target.value})} placeholder="Ex: contato@empresa.com" />
                </div>
              </div>

              <div className="pt-8 flex gap-4">
                <button type="button" onClick={handleCloseModal} className="flex-1 py-4 text-stone-500 font-bold text-sm hover:text-stone-300 transition-colors">
                  Descartar
                </button>
                <button type="submit" className="flex-1 bg-amber-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-amber-600/20 hover:bg-amber-700 transition-all text-sm">
                  {isEditing ? 'Salvar Alterações' : 'Salvar Fornecedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {supplierToDelete && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
          <div className="bg-stone-900 rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl border border-rose-900/20 animate-in zoom-in duration-200">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Remover Parceiro?</h3>
              <p className="text-stone-500 text-sm leading-relaxed font-medium">
                Tem certeza que deseja remover este fornecedor? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="p-6 bg-black/40 flex flex-col gap-3">
              <button onClick={confirmDelete} className="w-full bg-rose-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all">
                Remover Definitivamente
              </button>
              <button onClick={() => setSupplierToDelete(null)} className="w-full bg-stone-800 text-stone-400 py-3.5 rounded-2xl font-bold text-sm hover:text-stone-300">
                Manter Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
