'use client';

import { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import { ProductType, getTierData } from './data';
import { useGoldRates } from '@/hooks/useGoldRates';
import Link from 'next/link';
import { Table, RefreshCcw, Scale, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { formatInr, formatInrDigits } from '@/lib/format';

const PRODUCT_LOGOS: Record<string, string> = {
  Ring: '/logos/ring.svg',
  Earring: '/logos/earring.svg',
  Chain: '/logos/chain.svg',
  Necklace: '/logos/necklace.svg',
  Haram: '/logos/necklace.svg',
  Coin: '/logos/gold-coin.svg',
  Bracelet: '/logos/bangle.svg',
  Pendant: '/logos/chain.svg',
  Bangle: '/logos/bangle.svg',
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
    const wasteGrams = data.waste;
    const labCharge = data.lab;

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
            <Table size={14} className="text-[#8B2332]" />
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
                <label className="text-[10px] font-black text-gray-800 uppercase tracking-[0.12em]">{t('productType')}</label>
              </div>
              <div className="relative flex items-center group w-24 shrink-0">
                <select
                  value={product}
                  onChange={(e) => setProduct(e.target.value as ProductType)}
                  className="w-full min-h-[2.5rem] pr-5 py-1.5 bg-transparent border-b border-gray-100 focus:border-[#8B2332] outline-none transition-all text-base font-bold text-gray-800 appearance-none cursor-pointer text-right"
                >
                  {['Ring', 'Earring', 'Chain', 'Haram', 'Necklace', 'Bracelet', 'Pendant', 'Bangle', 'Other', 'Coin'].map((item) => (
                    <option key={item} value={item}>{t(item as any)}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
              </div>
            </div>

            {/* Weight Card */}
            <div className="bg-white px-4 py-3 rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-gray-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 shrink-0 min-w-0">
                <Scale size={16} strokeWidth={1.6} className="text-black opacity-70 shrink-0" />
                <label className="text-[10px] font-black text-gray-800 uppercase tracking-[0.12em]">{t('weightGrams')}</label>
              </div>
              <div className="relative flex items-center group w-24 shrink-0">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder=""
                  value={weight}
                  onFocus={() => setWeight('')}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d*\.?\d*$/.test(val)) setWeight(val);
                  }}
                  className="w-full min-h-[2.5rem] pr-4 py-1.5 bg-transparent border-b border-gray-100 focus:border-[#8B2332] outline-none transition-all text-base font-bold text-gray-800 text-right"
                />
                <span className="absolute right-0 text-base font-normal text-gray-400 tracking-normal">g</span>
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
                <label className="text-[10px] font-black text-gray-800 uppercase tracking-[0.12em]">{t('goldRate22')}</label>
                {isSyncing && <RefreshCcw size={12} className="animate-spin text-[#D4AF37] shrink-0" />}
              </div>
              <div className="w-24 shrink-0 flex items-center justify-end min-h-[2.5rem] border-b border-gray-100 focus-within:border-[#8B2332] transition-all group">
                <div className="flex items-center gap-0.5">
                  <span className="text-base font-bold text-gray-400 shrink-0 leading-none">₹</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formatInrDigits(goldRate)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/,/g, '');
                      if (raw === '' || /^\d*\.?\d*$/.test(raw)) setGoldRate(raw);
                    }}
                    size={Math.max(formatInrDigits(goldRate).length, 4)}
                    className="w-auto max-w-[10ch] bg-transparent outline-none text-base font-bold text-gray-800 py-1.5"
                  />
                </div>
              </div>
            </div>

            {/* Karat Selector */}
            <div className="bg-white px-4 py-3 rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-gray-50 flex items-center justify-between gap-3">
              <label className="shrink-0 text-[10px] font-black text-gray-800 uppercase tracking-[0.12em]">Gold Karat</label>
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
                <span className="text-[10px] font-black text-gray-800 uppercase tracking-[0.12em]">{t('totalAmount')}</span>
                <div className="flex items-center gap-1 text-[#8B2332]">
                  <span className="text-4xl font-black tracking-tighter">₹</span>
                  <span className="text-4xl font-black tracking-tighter">
                    {formatInr(Math.round(calculations.totalAmount))}
                  </span>
                </div>
              </div>

              <div className="pt-6 flex-1 flex flex-col gap-6">
                <div className="px-8 flex flex-col divide-y divide-gray-100">
                  <div className="flex items-center justify-between py-3.5 first:pt-0">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-800 uppercase tracking-[0.12em]">{t('goldValue')}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">({weight}g × ₹{formatInr(calculations.numGoldRate)})</span>
                    </div>
                    <span className="text-lg font-bold text-gray-800">
                      ₹{formatInr(calculations.goldValue, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3.5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-gray-800 uppercase tracking-[0.12em]">{t('wastageCost')}</span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">({calculations.wasteGrams}g × ₹{formatInr(calculations.numGoldRate)})</span>
                    </div>
                    <span className="text-lg font-bold text-gray-800">
                      ₹{formatInr(calculations.wastageCost, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3.5">
                    <span className="text-[10px] font-black text-gray-800 uppercase tracking-[0.12em]">{t('labourCharge')}</span>
                    <span className="text-lg font-bold text-gray-800">
                      ₹{formatInr(calculations.labCharge, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* VA Info Area — full card width */}
                <div className="w-full px-5 sm:px-8 py-6 border-t border-b border-gray-100 bg-white">
                  <div className="flex items-start w-full">
                    <div className="flex-1 min-w-0 flex flex-col items-center gap-2.5 pr-3 text-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.12em] whitespace-nowrap">
                        {t('wasteMg') || 'Wastage'}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-gray-800 leading-none whitespace-nowrap">
                        {calculations.wasteGrams.toFixed(3)}
                        <span className="ml-0.5 text-gray-400 font-semibold">g</span>
                      </span>
                    </div>

                    <div className="w-px self-stretch bg-gray-100 shrink-0" aria-hidden />

                    <div className="flex-1 min-w-0 flex flex-col items-center gap-2.5 px-3 text-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.12em] whitespace-nowrap">
                        {t('overallVaPercent') || 'VA %'}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-[#D4AF37] leading-none whitespace-nowrap">
                        {calculations.vaPercent.toFixed(2)}%
                      </span>
                    </div>

                    <div className="w-px self-stretch bg-gray-100 shrink-0" aria-hidden />

                    <div className="flex-1 min-w-0 flex flex-col items-center gap-2.5 pl-3 text-center">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.12em] whitespace-nowrap">
                        {t('totalVaAmount') || 'VA Amt'}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-[#8B2332] leading-none whitespace-nowrap">
                        ₹{formatInr(calculations.vaAmount, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto px-8 pt-4 pb-8">
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
