
import React from 'react';
import { Truck, Star, Phone, Plus } from 'lucide-react';
import { Supplier } from '../types';

interface SuppliersProps {
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
}

const Suppliers: React.FC<SuppliersProps> = ({ suppliers, setSuppliers }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-stone-800">Catálogo de Parceiros</h3>
        <button className="bg-stone-900 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
          <Plus size={20} /> Adicionar Fornecedor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {suppliers.map(s => (
          <div key={s.id} className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-stone-50 rounded-lg text-stone-400">
                <Truck size={20} />
              </div>
              <div className="flex gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} fill={i < s.rating ? 'currentColor' : 'none'} />
                ))}
              </div>
            </div>
            <h4 className="font-bold text-stone-800">{s.name}</h4>
            <span className="inline-block mt-1 px-2 py-0.5 bg-stone-100 text-stone-500 text-[10px] font-bold rounded uppercase">
              {s.category}
            </span>
            <div className="mt-4 pt-4 border-t border-stone-50 text-xs text-stone-500 flex items-center gap-2">
              <Phone size={14} /> {s.contact}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Suppliers;
