'use client';

import { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import { ProductType, getTierData } from './data';
import { useGoldRates } from '@/hooks/useGoldRates';
import Link from 'next/link';
import { Calculator as CalcIcon, Percent, Table, RefreshCcw, Package, Scale, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function CalculatorPage() {
  const [product, setProduct] = useState<ProductType>('Ring');
  const [weight, setWeight] = useState<string>('1');
  const [goldRate, setGoldRate] = useState<string>('');
  const { rates, isSyncing } = useGoldRates();
  const { t } = useLanguage();

  useEffect(() => {
    // Sync gold rate input with live rate from API
    if (rates && rates.k22) {
      setGoldRate(rates.k22.toString());
    }
  }, [rates]);

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
    <main className="min-h-screen bg-[#FDFCFB] pb-12">
      <Header rates={rates || undefined} />

      <div className="max-w-5xl mx-auto px-4 mt-8">

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-10">
          {/* Product Name Card */}
          <div className="col-span-2 md:col-span-1 bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]"></div>
            <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-3">{t('productName')}</label>
            <div className="relative flex items-center">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500">
                <Package size={14} />
              </span>
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value as ProductType)}
                className="w-full pl-8 py-2 bg-transparent border-b-2 border-gray-100 focus:border-[#D4AF37] outline-none transition-all font-bold text-lg text-gray-800 appearance-none cursor-pointer"
              >
                {['Ring', 'Earring', 'Chain', 'Haram', 'Necklace', 'Coin'].map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronDown size={14} strokeWidth={3} />
              </div>
            </div>
          </div>

          {/* Weight Card */}
          <div className="col-span-1 md:col-span-1 bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]"></div>
            <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-3">{t('weightGrams')}</label>
            <div className="relative">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500">
                <Scale size={14} />
              </span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={weight}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d*\.?\d*$/.test(val)) setWeight(val);
                }}
                className="w-full pl-8 py-2 bg-transparent border-b-2 border-gray-100 focus:border-[#D4AF37] outline-none transition-all font-bold text-lg text-gray-800"
              />
              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 font-bold">g</span>
            </div>
          </div>

          {/* Gold Rate Card */}
          <div className="col-span-1 md:col-span-1 bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]"></div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-xs font-black text-gray-600 uppercase tracking-widest">{t('goldRate22')}</label>
              {isSyncing && <RefreshCcw size={12} className="animate-spin text-[#D4AF37]" />}
            </div>
            <div className="relative">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500">
                <span className="text-sm font-bold">₹</span>
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={goldRate}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d*\.?\d*$/.test(val)) setGoldRate(val);
                }}
                className="w-full pl-8 py-2 bg-transparent border-b-2 border-gray-100 focus:border-[#D4AF37] outline-none transition-all font-bold text-lg text-gray-800"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Detailed Breakup Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="bg-[#333333] text-white px-4 py-3 flex items-center gap-3">
              <CalcIcon size={20} />
              <h2 className="text-base font-black uppercase tracking-widest">{t('detailedBreakup')}</h2>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-center space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">{t('goldValue')}</span>
                  <span className="text-[11px] text-gray-500 font-medium font-mono tracking-tight">({weight}g × ₹{calculations.numGoldRate.toLocaleString()})</span>
                </div>
                <span className="text-sm font-bold text-gray-800">₹{calculations.goldValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">{t('wastageCost')}</span>
                  <span className="text-[11px] text-gray-500 font-medium font-mono tracking-tight">({calculations.wasteGrams}g × ₹{calculations.numGoldRate.toLocaleString()})</span>
                </div>
                <span className="text-sm font-bold text-gray-800">₹{calculations.wastageCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b-2 border-dashed border-gray-100">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">{t('labourCharge')}</span>
                <span className="text-sm font-bold text-gray-800">₹{calculations.labCharge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-xs font-black text-gray-800 uppercase tracking-widest">{t('totalAmount')}</span>
                <span className="text-xl md:text-2xl font-black text-[#D4AF37]">₹{Math.round(calculations.totalAmount).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* VA Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-amber-100/50 border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white px-4 py-3 flex items-center gap-3">
              <Percent size={20} />
              <h2 className="text-base font-black uppercase tracking-widest">{t('valueAddition')}</h2>
            </div>
            <div className="p-4 flex-1 grid grid-cols-2 gap-0 items-center">
              {/* Left Column: Wastage & Labour */}
              <div className="space-y-4 pr-4 border-r-2 border-dashed border-gray-100">
                <div className="text-center">
                  <p className="text-[11px] text-gray-600 font-black uppercase tracking-widest mb-1">{t('wasteMg')}</p>
                  <p className="text-lg md:text-xl font-black text-gray-800">
                    {calculations.wasteGrams < 1
                      ? `${calculations.wasteGrams.toFixed(3)}`
                      : `${calculations.wasteGrams}g`}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[11px] text-gray-600 font-black uppercase tracking-widest mb-1">{t('labourCharge')}</p>
                  <p className="text-lg md:text-xl font-black text-gray-800">₹{calculations.labCharge.toLocaleString()}</p>
                </div>
              </div>

              {/* Right Column: VA Totals */}
              <div className="pl-4 flex flex-col justify-center space-y-4">
                <div className="text-center">
                  <p className="text-gray-600 uppercase text-[11px] font-black tracking-widest mb-1">{t('overallVaPercent')}</p>
                  <p className="text-2xl md:text-3xl font-black text-[#D4AF37] tracking-tighter">{calculations.vaPercent.toFixed(2)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 uppercase text-[11px] font-black tracking-widest mb-1">{t('totalVaAmount')}</p>
                  <p className="text-lg md:text-xl font-black text-[#D4AF37]">₹{calculations.vaAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link href="/table" className="inline-flex items-center gap-4 bg-[#333333] text-white px-10 py-5 rounded-2xl hover:bg-black hover:scale-105 transform transition-all shadow-2xl shadow-gray-200 font-black uppercase tracking-[0.2em] text-xs">
            <Table size={18} className="text-[#D4AF37]" />
            {t('viewReferenceTable')}
          </Link>
        </div>

        <p className="mt-12 text-center text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">
          {t('sriVasaviJewellery')}
        </p>
      </div>
    </main>
  );
}
