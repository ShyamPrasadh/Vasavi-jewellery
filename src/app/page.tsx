'use client';

import { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import { ProductType, getTierData } from './data';
import { useGoldRates } from '@/hooks/useGoldRates';
import Link from 'next/link';
import { Table, RefreshCcw, Scale, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const PRODUCT_LOGOS: Record<string, string> = {
  Ring: '/logos/ring.svg',
  Earring: '/logos/earring.svg',
  Chain: '/logos/chain.svg',
  Necklace: '/logos/necklace.svg',
  Haram: '/logos/necklace.svg',
  Coin: '/logos/gold-coin.svg',
  Bracelet: '/logos/gold-bar.svg',
  Pendant: '/logos/gold-bar.svg',
  Bangle: '/logos/gold-bar.svg',
  Other: '/logos/gold-bar.svg',
};

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
            <h1 className="text-[16px] md:text-[20px] text-gray-900 font-heading uppercase tracking-normal">
              {t('goldCalculator')}
            </h1>
            <p className="text-[9px] md:text-[10px] font-bold text-[#8B2332] uppercase tracking-normal mt-0.5">
              {t('livePriceWastageCalculator')}
            </p>
          </div>
          <Link href="/table" className="inline-flex shrink-0 items-center gap-2 bg-white border border-gray-100 px-3 md:px-4 py-2 md:py-2.5 rounded-xl hover:border-[#D4AF37]/30 transition-all shadow-[0_2px_15px_rgba(0,0,0,0.03)] group mt-[10px]">
            <Table size={14} className="text-[#D4AF37]" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-normal md:hidden">Table</span>
            <span className="hidden md:inline text-[10px] font-black text-gray-500 uppercase tracking-normal">{t('viewReferenceTable')}</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Inputs — compact label-left / value-right rows */}
          <div className="lg:col-span-5 space-y-3 md:space-y-4">
            {/* Product Type Card */}
            <div className="bg-white px-4 py-3 rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-gray-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 shrink-0 min-w-0">
                <img
                  src={PRODUCT_LOGOS[product] || '/logos/gold-bar.svg'}
                  alt=""
                  className="w-4 h-4 object-contain opacity-70"
                />
                <label className="text-[12px] md:text-[13px] font-black text-gray-800 uppercase tracking-normal">{t('productType')}</label>
              </div>
              <div className="relative flex items-center group flex-1 min-w-0 max-w-[55%]">
                <select
                  value={product}
                  onChange={(e) => setProduct(e.target.value as ProductType)}
                  className="w-full min-h-[2.5rem] pr-6 py-1.5 bg-transparent border-b border-gray-100 focus:border-[#8B2332] outline-none transition-all text-lg font-bold text-gray-800 appearance-none cursor-pointer text-right"
                >
                  {['Ring', 'Earring', 'Chain', 'Haram', 'Necklace', 'Bracelet', 'Pendant', 'Bangle', 'Other', 'Coin'].map((item) => (
                    <option key={item} value={item}>{t(item as any)}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
              </div>
            </div>

            {/* Weight Card */}
            <div className="bg-white px-4 py-3 rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-gray-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 shrink-0 min-w-0">
                <Scale size={14} className="text-gray-400 shrink-0" />
                <label className="text-[12px] md:text-[13px] font-black text-gray-800 uppercase tracking-normal">{t('weightGrams')}</label>
              </div>
              <div className="relative flex items-center group flex-1 min-w-0 max-w-[55%]">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={weight}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d*\.?\d*$/.test(val)) setWeight(val);
                  }}
                  className="w-full min-h-[2.5rem] pr-6 py-1.5 bg-transparent border-b border-gray-100 focus:border-[#8B2332] outline-none transition-all text-lg font-bold text-gray-800 text-right"
                />
                <span className="absolute right-0 text-lg font-bold text-gray-400 uppercase tracking-normal">g</span>
              </div>
            </div>

            {/* Gold Rate Card */}
            <div className="bg-white px-4 py-3 rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-gray-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 shrink-0 min-w-0">
                <img
                  src="/logos/gold-bar.svg"
                  alt=""
                  className="w-4 h-4 object-contain opacity-70 shrink-0"
                />
                <label className="text-[12px] md:text-[13px] font-black text-gray-800 uppercase tracking-normal">{t('goldRate22')}</label>
                {isSyncing && <RefreshCcw size={12} className="animate-spin text-[#D4AF37] shrink-0" />}
              </div>
              <div className="relative flex items-center group flex-1 min-w-0 max-w-[55%]">
                <span className="absolute left-0 text-lg font-bold text-gray-800 shrink-0">₹</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={goldRate}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d*\.?\d*$/.test(val)) setGoldRate(val);
                  }}
                  className="w-full min-h-[2.5rem] pl-5 py-1.5 bg-transparent border-b border-gray-100 focus:border-[#8B2332] outline-none transition-all text-lg font-bold text-gray-800 text-right"
                />
              </div>
            </div>

            {/* Karat Selector */}
            <div className="bg-white px-4 py-3 rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-gray-50 flex items-center justify-between gap-3">
              <label className="shrink-0 text-[12px] md:text-[13px] font-black text-gray-800 uppercase tracking-normal">Gold Karat</label>
              <div className="grid grid-cols-3 gap-1.5 flex-1 min-w-0 max-w-[65%]">
                {(['18KT', '22KT', '24KT'] as const).map((k) => (
                  <button
                    key={k}
                    onClick={() => setKarat(k)}
                    className={`py-2 rounded-xl text-xs font-black transition-all border ${karat === k
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
              <div className="pt-8 px-8 pb-6 border-b border-gray-50 flex items-center justify-between">
                <span className="text-xs font-black text-gray-800 uppercase tracking-normal">{t('totalAmount')}</span>
                <div className="flex items-center gap-1 text-[#8B2332]">
                  <span className="text-4xl font-black tracking-tighter">₹</span>
                  <span className="text-4xl font-black tracking-tighter">
                    {Math.round(calculations.totalAmount).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-8 pt-6 flex-1 flex flex-col gap-6">
                <div className="flex flex-col gap-4 border-b border-gray-50 pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-gray-800 uppercase tracking-normal">{t('goldValue')}</span>
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-tight">({weight}g × ₹{calculations.numGoldRate.toLocaleString()})</span>
                    </div>
                    <span className="text-lg font-bold text-gray-800">₹{calculations.goldValue.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-gray-800 uppercase tracking-normal">{t('wastageCost')}</span>
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-tight">({calculations.wasteGrams}g × ₹{calculations.numGoldRate.toLocaleString()})</span>
                    </div>
                    <span className="text-lg font-bold text-gray-800">₹{calculations.wastageCost.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-gray-800 uppercase tracking-normal">{t('labourCharge')}</span>
                    <span className="text-lg font-bold text-gray-800">₹{calculations.labCharge.toLocaleString()}</span>
                  </div>
                </div>

                {/* VA Info Area */}
                <div className="overflow-visible px-4 sm:px-5 md:px-6 py-5 sm:py-6 border border-[#D4AF37]/20 rounded-2xl grid grid-cols-3 bg-white">
                  <div className="min-w-0 text-center px-2 sm:px-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-normal leading-tight mb-1.5 whitespace-nowrap">
                      {t('wasteMg') || 'Wastage'}
                    </p>
                    <p className="text-lg font-black text-gray-800">
                      {calculations.wasteGrams.toFixed(3)}<span className="ml-0.5">g</span>
                    </p>
                  </div>
                  <div className="min-w-0 text-center px-2.5 sm:px-3 border-x border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-normal leading-tight mb-1.5 whitespace-nowrap">
                      {t('overallVaPercent') || 'VA %'}
                    </p>
                    <p className="text-base sm:text-lg font-black text-[#D4AF37]">{calculations.vaPercent.toFixed(2)}%</p>
                  </div>
                  <div className="min-w-0 text-center px-2 sm:px-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-normal leading-tight mb-1.5 whitespace-nowrap">
                      {t('totalVaAmount') || 'VA Amt'}
                    </p>
                    <p className="text-lg font-black text-[#8B2332]">
                      ₹{Math.round(calculations.vaAmount).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <button className="w-full bg-[#111827] text-white py-4 rounded-2xl text-[12px] font-black uppercase tracking-normal hover:bg-black transition-all active:scale-[0.98] shadow-2xl shadow-gray-200">
                    {t('requestQuote') || 'Request Quote'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-16 text-center text-[10px] text-gray-400 font-black uppercase tracking-normal opacity-40">
          {t('sriVasaviJewellery')}
        </p>
      </div>
    </main>
  );
}
