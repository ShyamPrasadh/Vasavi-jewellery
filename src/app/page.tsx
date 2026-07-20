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

      <div className="max-w-7xl px-4 md:px-5 mt-0.5 md:mt-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="mb-6 pt-[10px]">
            <h1 className="text-[16px] md:text-[20px] text-gray-900 font-heading uppercase">
              {t('goldCalculator')}
            </h1>
            <p className="text-[9px] md:text-[10px] font-bold text-[#8B2332] uppercase tracking-[0.1em] mt-0.5">
              {t('livePriceWastageCalculator')}
            </p>
          </div>
          <Link href="/table" className="inline-flex items-center gap-2 bg-white border border-gray-100 px-4 py-2.5 rounded-xl hover:border-[#D4AF37]/30 transition-all shadow-[0_2px_15px_rgba(0,0,0,0.03)] group">
            <Table size={14} className="text-[#D4AF37]" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('viewReferenceTable')}</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-5 space-y-6">
            {/* Product Name Card */}
            <div className="bg-white p-6 rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col gap-4">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('productName')}</label>
              <div className="relative flex items-center group">
                <div className="absolute left-0 p-2.5 bg-gray-50 rounded-xl text-gray-400 group-focus-within:text-[#8B2332] group-focus-within:bg-[#8B2332]/5 transition-all">
                  <Gem size={18} />
                </div>
                <select
                  value={product}
                  onChange={(e) => setProduct(e.target.value as ProductType)}
                  className="w-full pl-14 pr-4 py-3 bg-transparent border-b border-gray-100 focus:border-[#8B2332] outline-none transition-all font-bold text-lg text-gray-800 appearance-none cursor-pointer"
                >
                  {['Ring', 'Earring', 'Chain', 'Haram', 'Necklace', 'Bracelet', 'Pendant', 'Bangle', 'Other', 'Coin'].map((item) => (
                    <option key={item} value={item}>{t(item as any)}</option>
                  ))}
                </select>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            {/* Weight Card */}
            <div className="bg-white p-6 rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col gap-4">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('weightGrams')}</label>
              <div className="relative flex items-center group">
                <div className="absolute left-0 p-2.5 bg-gray-50 rounded-xl text-gray-400 group-focus-within:text-[#8B2332] group-focus-within:bg-[#8B2332]/5 transition-all">
                  <Scale size={18} />
                </div>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={weight}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d*\.?\d*$/.test(val)) setWeight(val);
                  }}
                  className="w-full pl-14 pr-4 py-3 bg-transparent border-b border-gray-100 focus:border-[#8B2332] outline-none transition-all font-bold text-lg text-gray-800"
                />
                <span className="absolute right-0 text-gray-400 font-bold uppercase text-sm tracking-widest">g</span>
              </div>
            </div>

            {/* Gold Rate Card */}
            <div className="bg-white p-6 rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col gap-4 relative">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('goldRate22')}</label>
                {isSyncing && <RefreshCcw size={12} className="animate-spin text-[#D4AF37]" />}
              </div>
              <div className="relative flex items-center group">
                <div className="absolute left-0 p-2.5 bg-gray-50 rounded-xl text-gray-400 group-focus-within:text-[#8B2332] group-focus-within:bg-[#8B2332]/5 transition-all font-bold">
                  ₹
                </div>
                <input
                  type="text"
                  inputMode="decimal"
                  value={goldRate}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d*\.?\d*$/.test(val)) setGoldRate(val);
                  }}
                  className="w-full pl-14 pr-4 py-3 bg-transparent border-b border-gray-100 focus:border-[#8B2332] outline-none transition-all font-bold text-lg text-gray-800"
                />
              </div>
            </div>

            {/* Karat Selector */}
            <div className="bg-white p-6 rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col gap-4">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Gold Karat</label>
              <div className="grid grid-cols-3 gap-3">
                {(['18KT', '22KT', '24KT'] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setKarat(k)}
                    className={`py-3 rounded-xl text-[11px] font-black transition-all border ${karat === k
                      ? 'bg-[#A87B00] text-white border-[#A87B00] shadow-lg shadow-[#A87B00]/20 scale-[1.02]'
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
            <div className="bg-white rounded-[40px] shadow-[0_15px_50px_rgba(0,0,0,0.04)] border border-gray-50 p-8 md:p-10 flex flex-col h-full ring-1 ring-gray-100/50">
              <div className="flex justify-between items-start mb-10">
                <div className="uppercase">
                  <p className="text-[11px] font-black text-gray-400 tracking-[0.3em] mb-2">{t('totalAmount')}</p>
                  <p className="text-4xl md:text-5xl font-black text-[#8B2332] flex items-baseline gap-1">
                    <span className="text-2xl font-bold">₹</span>
                    {Math.round(calculations.totalAmount).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-6 flex-1">
                <div className="flex justify-between py-2 border-b border-gray-50 group">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">{t('goldValue')}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">({weight}g × ₹{calculations.numGoldRate.toLocaleString()})</span>
                  </div>
                  <span className="text-lg font-black text-gray-800">₹{calculations.goldValue.toLocaleString()}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-50 group">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">{t('wastageCost')}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">({calculations.wasteGrams}g × ₹{calculations.numGoldRate.toLocaleString()})</span>
                  </div>
                  <span className="text-lg font-black text-gray-800">₹{calculations.wastageCost.toLocaleString()}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-50 group">
                  <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest leading-relaxed pt-1">{t('labourCharge')}</span>
                  <span className="text-lg font-black text-gray-800">₹{calculations.labCharge.toLocaleString()}</span>
                </div>
              </div>

              {/* VA Info Area */}
              <div className="mt-10 mb-10 p-6 bg-gray-50/50 rounded-3xl grid grid-cols-3 gap-4 border border-gray-100">
                <div className="text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('wasteMg') || 'Total Waste'}</p>
                  <p className="text-xl font-black text-gray-800">
                    {calculations.wasteGrams.toFixed(3)}<span className="text-xs ml-0.5">g</span>
                  </p>
                </div>
                <div className="text-center border-x border-gray-200">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('overallVaPercent') || 'Overall VA %'}</p>
                  <p className="text-xl font-black text-[#D4AF37]">{calculations.vaPercent.toFixed(2)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{t('totalVaAmount') || 'Total VA Amt'}</p>
                  <p className="text-xl font-black text-[#8B2332]">
                    <span className="text-xs mr-0.5">₹</span>{Math.round(calculations.vaAmount).toLocaleString()}
                  </p>
                </div>
              </div>

              <button className="w-full bg-black text-white py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] hover:bg-gray-900 transition-all active:scale-[0.98] shadow-2xl shadow-gray-200">
                {t('requestQuote') || 'Request Quote'}
              </button>
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
