
import React, { useState, useMemo } from 'react';
import { Calculator, Info, CheckCircle2, DollarSign, PieChart as PieChartIcon } from 'lucide-react';

const Simulator: React.FC = () => {
  const [cost, setCost] = useState<number>(0);
  const [markup, setMarkup] = useState<number>(40);
  const [taxes, setTaxes] = useState<number>(6);

  const results = useMemo(() => {
    // Standard Marcenaria logic: Price = (Cost * (1+Markup)) / (1 - Taxes)
    // Actually, common simplification: Cost + (Cost * markup%) + (Total * taxes%)
    // Let's use the Margin-based approach (safer for business)
    // Price = Cost / (1 - (Markup% + Taxes%)/100)
    
    const marginRatio = (markup + taxes) / 100;
    const price = marginRatio < 1 ? cost / (1 - marginRatio) : 0;
    const profit = price - cost - (price * (taxes / 100));
    const finalMargin = price > 0 ? (profit / price) * 100 : 0;

    return { price, profit, finalMargin };
  }, [cost, markup, taxes]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-amber-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-3xl font-black mb-2">Simulador de Preços</h3>
          <p className="text-amber-200/80 font-medium">Calcule o valor de venda ideal com base nos seus custos e margem desejada.</p>
        </div>
        <Calculator size={180} className="absolute -right-10 -bottom-10 text-white/5 rotate-12" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Info size={18} className="text-amber-600" />
            <h4 className="font-bold text-stone-800 uppercase text-xs tracking-widest">Parâmetros de Cálculo</h4>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Custo de Produção (R$)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">R$</span>
                <input 
                  type="number" 
                  className="w-full bg-stone-50 border-2 border-stone-100 rounded-xl py-3 pl-12 pr-4 focus:border-amber-500 focus:outline-none transition-all text-lg font-bold"
                  value={cost || ''}
                  onChange={e => setCost(Number(e.target.value))}
                  placeholder="0,00"
                />
              </div>
              <p className="text-[10px] text-stone-400 uppercase font-bold tracking-tighter">Inclua MDF, ferragens e mão de obra externa</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700 flex justify-between">
                Markup / Margem Bruta Desejada (%)
                <span className="text-amber-700 font-black">{markup}%</span>
              </label>
              <input 
                type="range" 
                min="0" max="100" 
                className="w-full accent-amber-700 h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer"
                value={markup}
                onChange={e => setMarkup(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700 flex justify-between">
                Impostos e Taxas (%)
                <span className="text-amber-700 font-black">{taxes}%</span>
              </label>
              <input 
                type="range" 
                min="0" max="30" 
                className="w-full accent-amber-700 h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer"
                value={taxes}
                onChange={e => setTaxes(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          <div className="bg-stone-900 rounded-2xl p-8 text-white shadow-xl flex flex-col items-center justify-center text-center">
            <span className="text-amber-500 text-xs font-black uppercase tracking-widest mb-4">Preço Sugerido de Venda</span>
            <p className="text-5xl font-black mb-2 tracking-tighter">
              {formatCurrency(results.price)}
            </p>
            <div className="flex items-center gap-2 mt-4 py-2 px-4 bg-white/10 rounded-full">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span className="text-xs font-bold text-emerald-100 uppercase tracking-tighter">Sugestão Competitiva</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white p-6 rounded-2xl border border-stone-100 flex flex-col items-center justify-center">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg mb-3">
                  <DollarSign size={20} />
                </div>
                <span className="text-[10px] font-bold text-stone-400 uppercase mb-1">Lucro Estimado</span>
                <p className="text-xl font-black text-stone-800">{formatCurrency(results.profit)}</p>
             </div>
             <div className="bg-white p-6 rounded-2xl border border-stone-100 flex flex-col items-center justify-center">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg mb-3">
                  <PieChartIcon size={20} />
                </div>
                <span className="text-[10px] font-bold text-stone-400 uppercase mb-1">Margem Final</span>
                <p className="text-xl font-black text-stone-800">{results.finalMargin.toFixed(1)}%</p>
             </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
            <h5 className="font-bold text-amber-800 text-sm mb-2 flex items-center gap-2">
              <Info size={16} /> Nota de Especialista
            </h5>
            <p className="text-xs text-amber-700 leading-relaxed">
              Este simulador utiliza o método de <strong>Preço de Venda por Margem de Contribuição</strong>. 
              Ele garante que a porcentagem de impostos seja aplicada sobre o valor final de venda, e não sobre o custo, protegendo sua margem de lucro real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulator;
