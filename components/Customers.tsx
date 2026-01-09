
import React, { useState } from 'react';
import { UserPlus, Search, Mail, Phone, MapPin } from 'lucide-react';
import { Customer } from '../types';

interface CustomersProps {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

const Customers: React.FC<CustomersProps> = ({ customers, setCustomers }) => {
  const [search, setSearch] = useState('');

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar cliente..." 
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border rounded-lg"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button className="bg-amber-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
          <UserPlus size={20} /> Novo Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:border-amber-500 transition-all cursor-pointer group">
            <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-amber-50 group-hover:text-amber-700 transition-colors">
              <span className="font-bold text-lg">{c.name.charAt(0)}</span>
            </div>
            <h4 className="font-bold text-lg text-stone-800 mb-2">{c.name}</h4>
            <div className="space-y-2 text-sm text-stone-500">
              <p className="flex items-center gap-2"><Mail size={14} /> {c.email}</p>
              <p className="flex items-center gap-2"><Phone size={14} /> {c.phone}</p>
              <p className="flex items-center gap-2"><MapPin size={14} /> {c.address}</p>
            </div>
            <div className="mt-6 pt-4 border-t border-stone-50 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-stone-400 uppercase font-bold">Total Gasto</p>
                <p className="font-bold text-emerald-700">R$ {c.totalSpent.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-stone-400 uppercase font-bold">Último Pedido</p>
                <p className="text-xs font-medium">{c.lastOrder}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Customers;
