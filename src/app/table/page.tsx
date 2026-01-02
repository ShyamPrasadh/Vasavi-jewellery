'use client';

import Header from '../components/Header';
import { RATE_DATA } from '../data';
import Link from 'next/link';
import { ArrowLeft, Calculator as CalcIcon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ReferenceTablePage() {
    const [rates, setRates] = useState({ k22: 7520, k24: 8200 });

    useEffect(() => {
        const fetchRates = async () => {
            try {
                const res = await fetch('/api/gold-rate');
                const data = await res.json();
                if (data.k22 && data.k24) {
                    setRates({ k22: data.k22, k24: data.k24 });
                }
            } catch (err) {
                console.error("Failed to sync rates:", err);
            }
        };
        fetchRates();
    }, []);

    return (
        <main className="min-h-screen bg-white">
            <Header rates={rates} />

            <div className="max-w-6xl mx-auto px-4 mt-8 pb-12">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-8 md:mb-12">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-[#333333] uppercase tracking-tighter">Reference Rate Table</h2>
                        <p className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">Standard Wastage & Labour Standards</p>
                    </div>
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#D4AF37] transition-all font-bold uppercase text-[10px] md:text-xs tracking-widest group w-fit">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Calculator
                    </Link>
                </div>

                <div className="overflow-x-auto rounded-3xl border border-gray-100 shadow-2xl bg-white overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#333333] text-white">
                                <th className="p-3 md:p-6 font-black uppercase text-xs tracking-[0.2em] border-r border-gray-700 sticky left-0 z-20 bg-[#333333]">Weight</th>
                                <th className="p-3 md:p-6 font-black uppercase text-xs tracking-[0.2em] border-r border-gray-700">Coin (Lab)</th>
                                <th className="p-3 md:p-6 font-black uppercase text-xs tracking-[0.2em] border-r border-gray-700 text-center">Ring/Earring (W/L)</th>
                                <th className="p-3 md:p-6 font-black uppercase text-xs tracking-[0.2em] border-r border-gray-700 text-center">Chain (W/L)</th>
                                <th className="p-3 md:p-6 font-black uppercase text-xs tracking-[0.2em] text-center">Haram/Necklace (W/L)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {RATE_DATA.map((row, index) => (
                                <tr
                                    key={row.weight}
                                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-gold/5 transition-colors`}
                                >
                                    <td className={`p-3 md:p-6 border-b border-gray-100 font-black text-lg border-r border-gray-100 sticky left-0 z-10 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>{row.weight}g</td>
                                    <td className="p-3 md:p-6 border-b border-gray-100 font-bold text-[#D4AF37] border-r border-gray-100">
                                        {row.Coin ? (
                                            <span className="flex flex-col">
                                                <span className="text-xl">₹{row.Coin.lab}</span>
                                                <span className="text-[10px] text-gray-400 uppercase">Fixed Lab</span>
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-300">₹{(row.weight * 100).toLocaleString()} (Calc)</span>
                                        )}
                                    </td>
                                    <td className="p-3 md:p-6 border-b border-gray-100 border-r border-gray-100 text-center">
                                        {row['Ring/Earring'] ? (
                                            <span className="inline-flex flex-col items-center">
                                                <span className="font-black text-gray-900 text-lg">
                                                    {row['Ring/Earring'].waste < 1 ? row['Ring/Earring'].waste.toFixed(3) : row['Ring/Earring'].waste + 'g'}
                                                </span>
                                                <span className="text-[10px] bg-[#333333] text-white px-2 py-0.5 rounded-full font-bold mt-1">₹{row['Ring/Earring'].lab} LAB</span>
                                            </span>
                                        ) : <span className="text-gray-200">─</span>}
                                    </td>
                                    <td className="p-3 md:p-6 border-b border-gray-100 border-r border-gray-100 text-center">
                                        {row['Chain'] ? (
                                            <span className="inline-flex flex-col items-center">
                                                <span className="font-black text-gray-900 text-lg">
                                                    {row['Chain'].waste < 1 ? row['Chain'].waste.toFixed(3) : row['Chain'].waste + 'g'}
                                                </span>
                                                <span className="text-[10px] bg-[#333333] text-white px-2 py-0.5 rounded-full font-bold mt-1">₹{row['Chain'].lab} LAB</span>
                                            </span>
                                        ) : <span className="text-gray-200">─</span>}
                                    </td>
                                    <td className="p-3 md:p-6 border-b border-gray-100 text-center">
                                        {row['Haram/Necklace'] ? (
                                            <span className="inline-flex flex-col items-center">
                                                <span className="font-black text-gray-900 text-lg">
                                                    {row['Haram/Necklace'].waste < 1 ? row['Haram/Necklace'].waste.toFixed(3) : row['Haram/Necklace'].waste + 'g'}
                                                </span>
                                                <span className="text-[10px] bg-[#333333] text-white px-2 py-0.5 rounded-full font-bold mt-1">₹{row['Haram/Necklace'].lab} LAB</span>
                                            </span>
                                        ) : <span className="text-gray-200">─</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-12 p-8 bg-[#333333] rounded-3xl text-white shadow-xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4 scale-150">
                        <CalcIcon size={200} />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-widest text-[#D4AF37]">Policy Note</h3>
                            <p className="mt-2 text-gray-400 text-sm max-w-xl">
                                For weights not explicitly listed above, the system automatically uses the parameters from the <span className="text-white font-bold underline">closest lower weight tier</span> to ensure fair valuation. All calculations are real-time and based on market rates.
                            </p>
                        </div>
                        <Link href="/" className="bg-[#D4AF37] text-white px-8 py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-lg hover:bg-[#B8860B] transition-all">
                            Launch Calculator
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
