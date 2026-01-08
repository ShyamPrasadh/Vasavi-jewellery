'use client';

import Header from '../components/Header';
import { RATE_DATA } from '../data';
import Link from 'next/link';
import { ArrowLeft, Calculator as CalcIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function ReferenceTablePage() {
    const [rates, setRates] = useState({ k22: 7520, k24: 8200 });
    const { t } = useLanguage();

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
        <main className="fixed inset-0 bg-white flex flex-col overflow-hidden">
            <Header rates={rates} />

            {/* Content Container - Starts after Header */}
            <div className="flex-1 flex flex-col pt-[70px] md:pt-[90px] min-h-0">

                {/* Fixed Title Section */}
                <div className="bg-white px-4 py-4 md:py-6 border-b border-gray-100 flex-shrink-0 z-40">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-6">
                        <div>
                            <h2 className="text-xl md:text-3xl font-black text-[#333333] uppercase tracking-tighter leading-tight">
                                {t('referenceRateTable')}
                            </h2>
                            <p className="text-gray-400 text-[9px] md:text-xs font-bold uppercase tracking-widest mt-1">
                                {t('standardWastageLabour')}
                            </p>
                        </div>
                        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#D4AF37] transition-all font-bold uppercase text-[10px] md:text-xs tracking-widest group w-fit">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            {t('backToCalculator')}
                        </Link>
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-8">
                    <div className="max-w-6xl mx-auto space-y-8">

                        {/* Table Container */}
                        <div className="rounded-2xl md:rounded-3xl border border-gray-100 shadow-xl bg-white overflow-hidden">
                            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
                                <table className="w-full border-separate border-spacing-0" style={{ minWidth: '800px' }}>
                                    <thead className="sticky top-0 z-30">
                                        <tr className="bg-[#333333] text-white">
                                            <th
                                                className="p-4 md:p-6 font-black uppercase text-[10px] md:text-xs tracking-[0.15em] md:tracking-[0.2em] border-r border-gray-700 bg-[#333333] text-left sticky left-0 z-40 min-w-[100px] md:min-w-[140px]"
                                            >
                                                {t('weight')}
                                            </th>
                                            <th className="p-4 md:p-6 font-black uppercase text-[10px] md:text-xs tracking-[0.15em] md:tracking-[0.2em] border-r border-gray-700 text-left bg-[#333333]">
                                                {t('coinLab')}
                                            </th>
                                            <th className="p-4 md:p-6 font-black uppercase text-[10px] md:text-xs tracking-[0.15em] md:tracking-[0.2em] border-r border-gray-700 text-center bg-[#333333]">
                                                {t('ringEarringWL')}
                                            </th>
                                            <th className="p-4 md:p-6 font-black uppercase text-[10px] md:text-xs tracking-[0.15em] md:tracking-[0.2em] border-r border-gray-700 text-center bg-[#333333]">
                                                {t('chainWL')}
                                            </th>
                                            <th className="p-4 md:p-6 font-black uppercase text-[10px] md:text-xs tracking-[0.15em] md:tracking-[0.2em] text-center bg-[#333333]">
                                                {t('haramNecklaceWL')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {RATE_DATA.map((row, index) => (
                                            <tr
                                                key={row.weight}
                                                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-gray-50 transition-colors group`}
                                            >
                                                <td
                                                    className={`p-4 md:p-6 border-b border-gray-100 font-black text-base md:text-lg border-r border-gray-100 sticky left-0 z-20 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} transition-colors group-hover:bg-gray-50 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.06)]`}
                                                >
                                                    {row.weight}g
                                                </td>
                                                <td className="p-4 md:p-6 border-b border-gray-100 font-bold text-[#D4AF37] border-r border-gray-100">
                                                    {row.Coin ? (
                                                        <span className="flex flex-col">
                                                            <span className="text-lg md:text-xl">₹{row.Coin.lab}</span>
                                                            <span className="text-[9px] md:text-[10px] text-gray-400 uppercase tracking-tighter">{t('fixedLab')}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-300">₹{(row.weight * 100).toLocaleString()} (Calc)</span>
                                                    )}
                                                </td>
                                                <td className="p-4 md:p-6 border-b border-gray-100 border-r border-gray-100 text-center">
                                                    {row['Ring/Earring'] ? (
                                                        <div className="inline-flex flex-col items-center">
                                                            <span className="font-black text-gray-900 text-base md:text-lg">
                                                                {row['Ring/Earring'].waste < 1 ? row['Ring/Earring'].waste.toFixed(3) : row['Ring/Earring'].waste + 'g'}
                                                            </span>
                                                            <span className="text-[9px] md:text-[10px] bg-[#333333] text-white px-2 py-0.5 rounded-md font-bold mt-1 inline-block">
                                                                ₹{row['Ring/Earring'].lab} LAB
                                                            </span>
                                                        </div>
                                                    ) : <span className="text-gray-200">─</span>}
                                                </td>
                                                <td className="p-4 md:p-6 border-b border-gray-100 border-r border-gray-100 text-center">
                                                    {row['Chain'] ? (
                                                        <div className="inline-flex flex-col items-center">
                                                            <span className="font-black text-gray-900 text-base md:text-lg">
                                                                {row['Chain'].waste < 1 ? row['Chain'].waste.toFixed(3) : row['Chain'].waste + 'g'}
                                                            </span>
                                                            <span className="text-[9px] md:text-[10px] bg-[#333333] text-white px-2 py-0.5 rounded-md font-bold mt-1 inline-block">
                                                                ₹{row['Chain'].lab} LAB
                                                            </span>
                                                        </div>
                                                    ) : <span className="text-gray-200">─</span>}
                                                </td>
                                                <td className="p-4 md:p-6 border-b border-gray-100 text-center">
                                                    {row['Haram/Necklace'] ? (
                                                        <div className="inline-flex flex-col items-center">
                                                            <span className="font-black text-gray-900 text-base md:text-lg">
                                                                {row['Haram/Necklace'].waste < 1 ? row['Haram/Necklace'].waste.toFixed(3) : row['Haram/Necklace'].waste + 'g'}
                                                            </span>
                                                            <span className="text-[9px] md:text-[10px] bg-[#333333] text-white px-2 py-0.5 rounded-md font-bold mt-1 inline-block">
                                                                ₹{row['Haram/Necklace'].lab} LAB
                                                            </span>
                                                        </div>
                                                    ) : <span className="text-gray-200">─</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Policy Note */}
                        <div className="pb-8">
                            <div className="p-6 md:p-8 bg-[#333333] rounded-2xl md:rounded-3xl text-white shadow-xl relative overflow-hidden">
                                <div className="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4 scale-150 pointer-events-none">
                                    <CalcIcon size={200} />
                                </div>
                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                                    <div className="text-center md:text-left">
                                        <h3 className="text-lg md:text-xl font-black uppercase tracking-widest text-[#D4AF37]">{t('policyNote')}</h3>
                                        <p className="mt-2 text-gray-400 text-[10px] md:text-sm max-w-xl leading-relaxed">
                                            {t('policyNoteDescription')}
                                        </p>
                                    </div>
                                    <Link href="/" className="bg-[#D4AF37] text-white px-8 md:px-10 py-3 md:py-4 rounded-xl font-black uppercase text-[10px] md:text-xs tracking-[0.2em] shadow-lg hover:shadow-[#D4AF37]/20 hover:-translate-y-0.5 transition-all w-full md:w-auto text-center">
                                        {t('launchCalculator')}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
