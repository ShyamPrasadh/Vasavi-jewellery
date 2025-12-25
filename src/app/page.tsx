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
    <main className="min-h-screen bg-gray-50 pb-12">
      <Header rates={rates} />

      <div className="max-w-5xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-[#D4AF37]">
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Product Name</label>
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value as ProductType)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all font-semibold text-gray-800 appearance-none cursor-pointer"
            >
              {['Ring', 'Earring', 'Chain', 'Haram', 'Necklace', 'Coin'].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-[#333333]">
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Weight (Grams)</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={weight}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^\d*\.?\d*$/.test(val)) setWeight(val);
              }}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all font-bold text-xl text-gray-800"
            />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-[#D4AF37]">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider">Gold Rate (22KT)</label>
              {isSyncing && <RefreshCcw size={12} className="animate-spin text-[#D4AF37]" />}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
              <input
                type="text"
                inputMode="decimal"
                value={goldRate}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^\d*\.?\d*$/.test(val)) setGoldRate(val);
                }}
                className="w-full pl-8 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all font-bold text-xl text-gray-800"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Detailed Breakup Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-[#333333] text-white p-4 flex items-center gap-2">
              <CalcIcon size={20} />
              <h2 className="text-lg font-semibold uppercase tracking-wider">Detailed Breakup</h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center text-gray-600">
                <span>Gold Value ({calculations.numWeight}g × ₹{calculations.numGoldRate})</span>
                <span className="font-medium text-gray-900">₹{calculations.goldValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Wastage Cost ({calculations.wasteGrams}g × ₹{calculations.numGoldRate})</span>
                <span className="font-medium text-gray-900">₹{calculations.wastageCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600 pb-4 border-b border-gray-50">
                <span>Labour / Making Charge</span>
                <span className="font-medium text-gray-900">₹{calculations.labCharge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-xl font-bold text-gray-900">Total Amount</span>
                <span className="text-2xl font-bold text-[#D4AF37]">₹{Math.round(calculations.totalAmount).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* VA Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-[#D4AF37] text-white p-4 flex items-center gap-2">
              <Percent size={20} />
              <h2 className="text-lg font-semibold uppercase tracking-wider">Value Addition (VA)</h2>
            </div>
            <div className="p-8 flex flex-col justify-center h-full space-y-8">
              <div className="text-center space-y-2">
                <p className="text-gray-500 uppercase text-xs font-bold tracking-widest">VA Amount (Waste + Lab)</p>
                <p className="text-5xl font-bold text-[#333333]">₹{calculations.vaAmount.toLocaleString()}</p>
              </div>
              <div className="text-center space-y-2 pt-4">
                <p className="text-gray-500 uppercase text-xs font-bold tracking-widest">VA Percentage</p>
                <p className="text-4xl font-bold text-[#D4AF37]">{calculations.vaPercent.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link href="/table" className="inline-flex items-center gap-3 bg-[#333333] text-white px-8 py-4 rounded-full hover:bg-black hover:scale-105 transform transition-all shadow-2xl font-black uppercase tracking-widest text-sm">
            <Table size={18} className="text-[#D4AF37]" />
            View Reference Rate Table
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-gray-400 font-medium uppercase tracking-[0.3em] opacity-50">
          Professional Jewellery Management System v2.0
        </p>
      </div>
    </main>
  );
}
