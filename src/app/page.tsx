'use client';

import { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import { ProductType, getTierData } from './data';
import { useGoldRates } from '@/hooks/useGoldRates';
import Link from 'next/link';
import { Calculator as CalcIcon, Percent, Table, RefreshCcw, Gem, Scale, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function CalculatorPage() {
  const [product, setProduct] = useState<ProductType>('Ring');
  const [weight, setWeight] = useState<string>('1');
  const [goldRate, setGoldRate] = useState<string>('');
  const [karat, setKarat] = useState<'18KT' | '22KT' | '24KT'>('22KT');
  const { rates, isSyncing } = useGoldRates();
  const { t } = useLanguage();

  useEffect(() => {
    // Sync gold rate input with live rate from API based on selected Karat
    if (rates) {
      if (karat === '22KT' && rates.k22) setGoldRate(rates.k22.toString());
      else if (karat === '24KT' && rates.k24) setGoldRate(rates.k24.toString());
      else if (karat === '18KT' && rates.k22) setGoldRate(Math.round(rates.k22 * 0.818).toString()); // Approx 18K rate
    }
  }, [rates, karat]);

  const calculations = useMemo(() => {
    const numWeight = parseFloat(weight) || 0;
    const numGoldRate = parseFloat(goldRate) || 0;

    const data = getTierData(numWeight, product);
    const wasteGrams = (data as any)?.waste ?? 0;
    const labCharge = (data as any)?.lab ?? 0;

    const goldValue = numWeight * numGoldRate;
    const wastageCost = wasteGrams * numGoldRate;
    const totalAmount = goldValue + wastageCost + labCharge;
    const vaAmount = wastageCost + labCharge;
    const vaPercent = goldValue > 0 ? (vaAmount / goldValue) * 100 : 0;

    return {
      goldValue,
      wastageCost,
      labCharge,
      totalAmount,
      vaAmount,
      vaPercent,
      wasteGrams,
      numWeight,
      numGoldRate
    };
  }, [product, weight, goldRate]);

  return (
    <main className="min-h-screen bg-white pb-32 pt-[54px] md:pt-[60px]">
      <Header rates={rates || undefined} />

      <div className="max-w-7xl w-full mx-auto px-4 md:px-5 mt-0.5 md:mt-1">
        <div className="flex items-start justify-between gap-3 mb-8">
          <div className="pt-[10px] min-w-0">
            <h1 className="text-[16px] md:text-[20px] text-gray-900 font-heading uppercase">
              {t('goldCalculator')}
            </h1>
            <p className="text-[9px] md:text-[10px] font-bold text-[#8B2332] uppercase tracking-[0.1em] mt-0.5">
              {t('livePriceWastageCalculator')}
            </p>
          </div>
          <Link href="/table" className="inline-flex shrink-0 items-center gap-2 bg-white border border-gray-100 px-3 md:px-4 py-2 md:py-2.5 rounded-xl hover:border-[#D4AF37]/30 transition-all shadow-[0_2px_15px_rgba(0,0,0,0.03)] group mt-[10px]">
            <Table size={14} className="text-[#D4AF37]" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest md:hidden">Table</span>
            <span className="hidden md:inline text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('viewReferenceTable')}</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-5 space-y-6">
            {/* Product Name Card */}
            <div className="bg-white p-4 rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-800 uppercase tracking-[0.2em]">{t('productName')}</label>
              <div className="relative flex items-center group">
                <Gem size={16} className="absolute left-0 text-gray-400 transition-colors group-focus-within:text-[#8B2332]" />
                <select
                  value={product}
                  onChange={(e) => setProduct(e.target.value as ProductType)}
                  className="w-full pl-8 pr-8 py-1.5 bg-transparent border-b border-gray-100 focus:border-[#8B2332] outline-none transition-all font-bold text-xl text-gray-800 appearance-none cursor-pointer"
                >
                  {['Ring', 'Earring', 'Chain', 'Haram', 'Necklace', 'Bracelet', 'Pendant', 'Bangle', 'Other', 'Coin'].map((item) => (
                    <option key={item} value={item}>{t(item as any)}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
              </div>
            </div>

            {/* Weight Card */}
            <div className="bg-white p-4 rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-800 uppercase tracking-[0.2em]">{t('weightGrams')}</label>
              <div className="relative flex items-center group">
                <Scale size={16} className="absolute left-0 text-gray-400 transition-colors group-focus-within:text-[#8B2332]" />
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={weight}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d*\.?\d*$/.test(val)) setWeight(val);
                  }}
                  className="w-full pl-8 pr-8 py-1.5 bg-transparent border-b border-gray-100 focus:border-[#8B2332] outline-none transition-all font-bold text-xl text-gray-800"
                />
                <span className="absolute right-0 text-gray-400 font-bold uppercase text-sm tracking-widest">g</span>
              </div>
            </div>

            {/* Gold Rate Card */}
            <div className="bg-white p-4 rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col gap-2 relative">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-gray-800 uppercase tracking-[0.2em]">{t('goldRate22')}</label>
                {isSyncing && <RefreshCcw size={12} className="animate-spin text-[#D4AF37]" />}
              </div>
              <div className="relative flex items-center group">
                <span className="absolute left-0 text-lg font-bold text-gray-400 transition-colors group-focus-within:text-[#8B2332]">₹</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={goldRate}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d*\.?\d*$/.test(val)) setGoldRate(val);
                  }}
                  className="w-full pl-6 py-1.5 bg-transparent border-b border-gray-100 focus:border-[#8B2332] outline-none transition-all font-bold text-xl text-gray-800"
                />
              </div>
            </div>

            {/* Karat Selector */}
            <div className="bg-white p-4 rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-800 uppercase tracking-[0.2em]">Gold Karat</label>
              <div className="grid grid-cols-3 gap-2">
                {(['18KT', '22KT', '24KT'] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setKarat(k)}
                    className={`py-2.5 rounded-xl text-[11px] font-black transition-all border ${karat === k
                      ? 'bg-[#8B2332] text-white border-[#8B2332]'
                      : 'bg-white text-gray-400 border-gray-100 hover:border-[#A87B00]/30 hover:text-gray-600'
                      }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-50 overflow-hidden flex flex-col h-full">
              <div className="pt-5 px-5 pb-4 border-b border-gray-50 flex items-center justify-between">
                <span className="text-[10px] font-black text-gray-800 uppercase tracking-[0.2em]">{t('totalAmount')}</span>
                <div className="flex items-baseline gap-1 text-[#8B2332]">
                  <span className="text-xl font-bold opacity-80">₹</span>
                  <span className="text-4xl font-black tracking-tighter">
                    {Math.round(calculations.totalAmount).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-5 pt-4 flex-1 flex flex-col gap-4">
                <div className="flex flex-col gap-3 border-b border-gray-50 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-800 uppercase tracking-[0.2em]">{t('goldValue')}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">({weight}g × ₹{calculations.numGoldRate.toLocaleString()})</span>
                    </div>
                    <span className="text-lg font-bold text-gray-800">₹{calculations.goldValue.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-800 uppercase tracking-[0.2em]">{t('wastageCost')}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">({calculations.wasteGrams}g × ₹{calculations.numGoldRate.toLocaleString()})</span>
                    </div>
                    <span className="text-lg font-bold text-gray-800">₹{calculations.wastageCost.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-800 uppercase tracking-[0.2em]">{t('labourCharge')}</span>
                    <span className="text-lg font-bold text-gray-800">₹{calculations.labCharge.toLocaleString()}</span>
                  </div>
                </div>

                {/* VA Info Area */}
                <div className="px-5 py-3.5 border border-[#D4AF37]/20 rounded-2xl grid grid-cols-3 gap-3 bg-white">
                  <div className="min-w-0 text-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.12em] leading-tight mb-1">
                      {t('wasteMg') || 'Wastage'}
                    </p>
                    <p className="text-lg font-black text-gray-800">
                      {calculations.wasteGrams.toFixed(3)}<span className="ml-0.5">g</span>
                    </p>
                  </div>
                  <div className="min-w-0 text-center border-x border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.12em] leading-tight mb-1">
                      {t('overallVaPercent') || 'Overall VA %'}
                    </p>
                    <p className="text-lg font-black text-[#D4AF37]">{calculations.vaPercent.toFixed(2)}%</p>
                  </div>
                  <div className="min-w-0 text-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.12em] leading-tight mb-1">
                      {t('totalVaAmount') || 'Total VA Amt'}
                    </p>
                    <p className="text-lg font-black text-[#8B2332]">
                      ₹{Math.round(calculations.vaAmount).toLocaleString()}
                    </p>
                  </div>
                </div>

                <button className="mt-auto w-full bg-[#111827] text-white py-4 rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all active:scale-[0.98] shadow-2xl shadow-gray-200">
                  {t('requestQuote') || 'Request Quote'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-16 text-center text-[10px] text-gray-400 font-black uppercase tracking-[0.5em] opacity-40">
          {t('sriVasaviJewellery')}
        </p>
      </div>
    </main>
  );
}
