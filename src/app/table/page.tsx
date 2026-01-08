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
        <main className="h-screen bg-white pt-[70px] md:pt-[80px] flex flex-col overflow-hidden">
            <Header rates={rates} />

            {/* Fixed Title Section */}
            <div className="bg-white px-4 py-4 md:py-6 border-b border-gray-100 flex-shrink-0">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-6">
                    <div>
                        <h2 className="text-xl md:text-3xl font-black text-[#333333] uppercase tracking-tighter">{t('referenceRateTable')}</h2>
                        <p className="text-gray-400 text-[9px] md:text-xs font-bold uppercase tracking-widest mt-1">{t('standardWastageLabour')}</p>
                    </div>
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#D4AF37] transition-all font-bold uppercase text-[10px] md:text-xs tracking-widest group w-fit">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        {t('backToCalculator')}
                    </Link>
                </div>
            </div>

            {/* Scrollable Table Container */}
            <div className="flex-1 overflow-auto px-4 py-4 md:py-6">
                <div className="max-w-6xl mx-auto">
                    <div className="overflow-x-auto rounded-2xl md:rounded-3xl border border-gray-100 shadow-xl bg-white">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="bg-[#333333] text-white">
                                    <th className="p-3 md:p-6 font-black uppercase text-[10px] md:text-xs tracking-[0.15em] md:tracking-[0.2em] border-r border-gray-700 sticky left-0 z-20 bg-[#333333] min-w-[70px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">{t('weight')}</th>
                                    <th className="p-3 md:p-6 font-black uppercase text-[10px] md:text-xs tracking-[0.15em] md:tracking-[0.2em] border-r border-gray-700">{t('coinLab')}</th>
                                    <th className="p-3 md:p-6 font-black uppercase text-[10px] md:text-xs tracking-[0.15em] md:tracking-[0.2em] border-r border-gray-700 text-center">{t('ringEarringWL')}</th>
                                    <th className="p-3 md:p-6 font-black uppercase text-[10px] md:text-xs tracking-[0.15em] md:tracking-[0.2em] border-r border-gray-700 text-center">{t('chainWL')}</th>
                                    <th className="p-3 md:p-6 font-black uppercase text-[10px] md:text-xs tracking-[0.15em] md:tracking-[0.2em] text-center">{t('haramNecklaceWL')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {RATE_DATA.map((row, index) => (
                                    <tr
                                        key={row.weight}
                                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-gold/5 transition-colors`}
                                    >
                                        <td className={`p-3 md:p-6 border-b border-gray-100 font-black text-base md:text-lg border-r border-gray-100 sticky left-0 z-10 min-w-[70px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>{row.weight}g</td>
                                        <td className="p-3 md:p-6 border-b border-gray-100 font-bold text-[#D4AF37] border-r border-gray-100">
                                            {row.Coin ? (
                                                <span className="flex flex-col">
                                                    <span className="text-lg md:text-xl">₹{row.Coin.lab}</span>
                                                    <span className="text-[9px] md:text-[10px] text-gray-400 uppercase">{t('fixedLab')}</span>
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-300">₹{(row.weight * 100).toLocaleString()} (Calc)</span>
                                            )}
                                        </td>
                                        <td className="p-3 md:p-6 border-b border-gray-100 border-r border-gray-100 text-center">
                                            {row['Ring/Earring'] ? (
                                                <span className="inline-flex flex-col items-center">
                                                    <span className="font-black text-gray-900 text-base md:text-lg">
                                                        {row['Ring/Earring'].waste < 1 ? row['Ring/Earring'].waste.toFixed(3) : row['Ring/Earring'].waste + 'g'}
                                                    </span>
                                                    <span className="text-[9px] md:text-[10px] bg-[#333333] text-white px-2 py-0.5 rounded-full font-bold mt-1">₹{row['Ring/Earring'].lab} LAB</span>
                                                </span>
                                            ) : <span className="text-gray-200">─</span>}
                                        </td>
                                        <td className="p-3 md:p-6 border-b border-gray-100 border-r border-gray-100 text-center">
                                            {row['Chain'] ? (
                                                <span className="inline-flex flex-col items-center">
                                                    <span className="font-black text-gray-900 text-base md:text-lg">
                                                        {row['Chain'].waste < 1 ? row['Chain'].waste.toFixed(3) : row['Chain'].waste + 'g'}
                                                    </span>
                                                    <span className="text-[9px] md:text-[10px] bg-[#333333] text-white px-2 py-0.5 rounded-full font-bold mt-1">₹{row['Chain'].lab} LAB</span>
                                                </span>
                                            ) : <span className="text-gray-200">─</span>}
                                        </td>
                                        <td className="p-3 md:p-6 border-b border-gray-100 text-center">
                                            {row['Haram/Necklace'] ? (
                                                <span className="inline-flex flex-col items-center">
                                                    <span className="font-black text-gray-900 text-base md:text-lg">
                                                        {row['Haram/Necklace'].waste < 1 ? row['Haram/Necklace'].waste.toFixed(3) : row['Haram/Necklace'].waste + 'g'}
                                                    </span>
                                                    <span className="text-[9px] md:text-[10px] bg-[#333333] text-white px-2 py-0.5 rounded-full font-bold mt-1">₹{row['Haram/Necklace'].lab} LAB</span>
                                                </span>
                                            ) : <span className="text-gray-200">─</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 md:mt-12 p-6 md:p-8 bg-[#333333] rounded-2xl md:rounded-3xl text-white shadow-xl relative overflow-hidden">
                        <div className="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4 scale-150">
                            <CalcIcon size={200} />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                            <div>
                                <h3 className="text-lg md:text-xl font-black uppercase tracking-widest text-[#D4AF37]">{t('policyNote')}</h3>
                                <p className="mt-2 text-gray-400 text-xs md:text-sm max-w-xl">
                                    {t('policyNoteDescription')}
                                </p>
                            </div>
                            <Link href="/" className="bg-[#D4AF37] text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-black uppercase text-[10px] md:text-xs tracking-[0.2em] shadow-lg hover:bg-[#B8860B] transition-all">
                                {t('launchCalculator')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
