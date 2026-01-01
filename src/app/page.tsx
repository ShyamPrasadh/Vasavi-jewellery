'use client';

import { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import { ProductType, getTierData } from './data';
import Link from 'next/link';
import { Calculator as CalcIcon, Percent, Table, RefreshCcw } from 'lucide-react';

export default function CalculatorPage() {
  const [product, setProduct] = useState<ProductType>('Ring');
  const [weight, setWeight] = useState<string>('1');
  const [goldRate, setGoldRate] = useState<string>('7500');
  const [rates, setRates] = useState({ k22: 7520, k24: 8200 });
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const fetchRates = async () => {
      setIsSyncing(true);
      try {
        const res = await fetch('/api/gold-rate');
        const data = await res.json();
        if (data.k22 && data.k24) {
          setRates({ k22: data.k22, k24: data.k24 });
          setGoldRate((prev) => (prev === '7500' ? data.k22.toString() : prev));
        }
      } catch (err) {
        console.error("Failed to sync rates:", err);
      } finally {
        setIsSyncing(false);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 600000); // 10 min refresh
    return () => clearInterval(interval);
  }, []);

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
      <Header rates={rates} />

      <div className="max-w-5xl mx-auto px-4 mt-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-10 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-fit mx-auto">
          <div className="px-8 py-2.5 rounded-xl text-sm font-bold bg-[#630d0d] text-white shadow-lg shadow-red-900/20">
            Gold Calculator
          </div>
          <Link href="/pawn" className="px-8 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-[#630d0d] transition-all">
            Pawn Interest
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-10">
          {/* Product Name Card */}
          <div className="col-span-2 md:col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#630d0d]"></div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Product Name</label>
            <div className="relative">
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value as ProductType)}
                className="w-full py-2 bg-transparent border-b-2 border-gray-100 focus:border-[#630d0d] outline-none transition-all font-bold text-lg text-gray-800 appearance-none cursor-pointer"
              >
                {['Ring', 'Earring', 'Chain', 'Haram', 'Necklace', 'Coin'].map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* Weight Card */}
          <div className="col-span-1 md:col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]"></div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Weight (Grams)</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={weight}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d*\.?\d*$/.test(val)) setWeight(val);
                }}
                className="w-full py-2 bg-transparent border-b-2 border-gray-100 focus:border-[#D4AF37] outline-none transition-all font-bold text-2xl text-gray-800"
              />
              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 font-bold">g</span>
            </div>
          </div>

          {/* Gold Rate Card */}
          <div className="col-span-1 md:col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#630d0d]"></div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Gold Rate (22KT)</label>
              {isSyncing && <RefreshCcw size={12} className="animate-spin text-[#D4AF37]" />}
            </div>
            <div className="relative">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-300">₹</span>
              <input
                type="text"
                inputMode="decimal"
                value={goldRate}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d*\.?\d*$/.test(val)) setGoldRate(val);
                }}
                className="w-full pl-8 py-2 bg-transparent border-b-2 border-gray-100 focus:border-[#630d0d] outline-none transition-all font-bold text-2xl text-gray-800"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Detailed Breakup Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="bg-[#333333] text-white p-4 flex items-center gap-2">
              <CalcIcon size={20} />
              <h2 className="text-lg font-semibold uppercase tracking-wider">Detailed Breakup</h2>
            </div>
            <div className="p-8 flex-1 flex flex-col justify-center space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Gold Value</span>
                <span className="text-lg font-bold text-gray-800">₹{calculations.goldValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Wastage Cost</span>
                <span className="text-lg font-bold text-gray-800">₹{calculations.wastageCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-6 border-b-2 border-dashed border-gray-100">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Labour Charge</span>
                <span className="text-lg font-bold text-gray-800">₹{calculations.labCharge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-black text-gray-800 uppercase tracking-widest">Total Amount</span>
                <span className="text-4xl font-black text-[#630d0d]">₹{Math.round(calculations.totalAmount).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* VA Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-amber-100/50 border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white p-4 flex items-center gap-2">
              <Percent size={20} />
              <h2 className="text-lg font-semibold uppercase tracking-wider">Value Addition (VA)</h2>
            </div>
            <div className="p-8 flex-1 grid grid-cols-2 gap-0 items-center">
              {/* Left Column: Wastage & Labour */}
              <div className="space-y-10 pr-6 border-r-2 border-dashed border-gray-100">
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Waste (mg)</p>
                  <p className="text-3xl font-black text-gray-800">
                    {calculations.wasteGrams < 1
                      ? `${calculations.wasteGrams.toFixed(3)}`
                      : `${calculations.wasteGrams}g`}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Labour Charge</p>
                  <p className="text-3xl font-black text-gray-800">₹{calculations.labCharge.toLocaleString()}</p>
                </div>
              </div>

              {/* Right Column: VA Totals */}
              <div className="pl-10 flex flex-col justify-center space-y-10">
                <div className="text-center">
                  <p className="text-gray-400 uppercase text-[10px] font-black tracking-widest mb-2">Overall VA %</p>
                  <p className="text-5xl font-black text-[#D4AF37] tracking-tighter">{calculations.vaPercent.toFixed(2)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 uppercase text-[10px] font-black tracking-widest mb-2">Total VA Amount</p>
                  <p className="text-3xl font-black text-[#630d0d]">₹{calculations.vaAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link href="/table" className="inline-flex items-center gap-4 bg-[#630d0d] text-white px-10 py-5 rounded-2xl hover:bg-black hover:scale-105 transform transition-all shadow-2xl shadow-red-900/30 font-black uppercase tracking-[0.2em] text-xs">
            <Table size={18} className="text-[#D4AF37]" />
            View Reference Rate Table
          </Link>
        </div>

        <p className="mt-12 text-center text-[10px] text-gray-300 font-black uppercase tracking-[0.4em]">
          Sri Vasavi Jewellery
        </p>
      </div>
    </main>
  );
}
