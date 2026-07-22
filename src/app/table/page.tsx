'use client';

import Header from '../components/Header';
import { RATE_DATA } from '../data';
import Link from 'next/link';
import { ArrowLeft, Calculator as CalcIcon } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useSidebar } from '@/context/SidebarContext';
import { useGoldRates } from '@/hooks/useGoldRates';
import { formatInr } from '@/lib/format';

export default function ReferenceTablePage() {
    const { rates } = useGoldRates();
    const { t } = useLanguage();
    const { isCollapsed } = useSidebar();

    return (
        <main className={`fixed top-0 left-0 right-0 bottom-0 bg-white flex flex-col overflow-hidden transition-all duration-300 ${isCollapsed ? 'md:left-[64px]' : 'md:left-[280px]'}`}>
            <Header rates={rates || undefined} />

            <div className="flex-1 flex flex-col pt-[54px] md:pt-[60px] min-h-0">

                {/* Title */}
                <div className="bg-white px-4 md:px-5 py-1.5 border-b border-gray-100 flex-shrink-0">
                    <div className="w-full flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h1 className="text-[16px] md:text-[20px] text-gray-900 uppercase font-heading leading-tight">
                                {t('referenceRateTable')}
                            </h1>
                            <p className="text-[9px] md:text-[10px] font-bold text-[#8B2332] uppercase tracking-[0.1em] mt-0.5">
                                {t('standardWastageLabour')}
                            </p>
                        </div>
                        <Link href="/" className="inline-flex shrink-0 items-center gap-1.5 text-gray-400 hover:text-[#D4AF37] transition-all font-bold uppercase text-[10px] md:text-xs tracking-widest group">
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="md:hidden">Back</span>
                            <span className="hidden md:inline">{t('backToCalculator')}</span>
                        </Link>
                    </div>
                </div>

                {/*
                  Outer scroll: reveals policy after the tall table card.
                  Inner scroll (inside card): vertical sticky header + horizontal scroll.
                  Side margins stay on the outer padded column so nothing clips the viewport edge.
                */}
                <div className="no-scrollbar flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 md:px-5 py-4 md:py-5">
                    <div className="w-full flex flex-col gap-4 md:gap-5 pb-6">

                        {/* Table card fills first screen; scrolls internally */}
                        <div
                            className="rounded-2xl md:rounded-3xl border border-gray-100 shadow-xl bg-white overflow-hidden w-full"
                            style={{ height: 'calc(100dvh - 11rem)' }}
                        >
                            <div className="no-scrollbar h-full w-full overflow-auto overscroll-contain">
                                <table className="border-separate border-spacing-0 w-full min-w-[52rem]">
                                    <thead>
                                        <tr className="bg-[#333333] text-white">
                                            <th className="p-2 md:p-3 font-black uppercase text-[10px] md:text-xs tracking-[0.15em] border-r border-gray-700 bg-[#333333] text-left sticky top-0 left-0 z-40 min-w-[5.5rem] md:min-w-[7rem]">
                                                {t('weight')}
                                            </th>
                                            <th className="p-3 md:p-4 font-black uppercase text-[10px] md:text-xs tracking-[0.15em] border-r border-gray-700 text-left bg-[#333333] sticky top-0 z-30 whitespace-nowrap">
                                                {t('coinLab')}
                                            </th>
                                            <th className="p-3 md:p-4 font-black uppercase text-[10px] md:text-xs tracking-[0.15em] border-r border-gray-700 text-center bg-[#333333] sticky top-0 z-30 whitespace-nowrap">
                                                {t('ringEarringWL')}
                                            </th>
                                            <th className="p-3 md:p-4 font-black uppercase text-[10px] md:text-xs tracking-[0.15em] border-r border-gray-700 text-center bg-[#333333] sticky top-0 z-30 whitespace-nowrap">
                                                {t('chainWL')}
                                            </th>
                                            <th className="p-3 md:p-4 font-black uppercase text-[10px] md:text-xs tracking-[0.15em] text-center bg-[#333333] sticky top-0 z-30 whitespace-nowrap">
                                                {t('haramNecklaceWL')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {RATE_DATA.map((row, index) => (
                                            <tr
                                                key={row.weight}
                                                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'} hover:bg-gray-50 transition-colors group`}
                                            >
                                                <td
                                                    className={`p-3 md:p-4 border-b border-gray-100 font-black text-base md:text-lg text-[#D4AF37] border-r border-gray-100 sticky left-0 z-20 whitespace-nowrap ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} group-hover:bg-gray-50 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.06)]`}
                                                >
                                                    {row.weight}g
                                                </td>
                                                <td className="p-3 md:p-4 border-b border-gray-100 font-bold text-gray-900 border-r border-gray-100 whitespace-nowrap">
                                                    {row.Coin ? (
                                                        <span className="text-lg md:text-xl">₹{formatInr(row.Coin.lab)}</span>
                                                    ) : (
                                                        <span className="text-lg md:text-xl">₹{formatInr(row.weight * 100)}</span>
                                                    )}
                                                </td>
                                                <td className="p-3 md:p-4 border-b border-gray-100 border-r border-gray-100 text-center">
                                                    {row['Ring/Earring'] ? (
                                                        <div className="inline-flex flex-col items-center">
                                                            <span className="font-black text-gray-900 text-base md:text-lg">
                                                                {row['Ring/Earring'].waste < 1 ? row['Ring/Earring'].waste.toFixed(3) : `${row['Ring/Earring'].waste}g`}
                                                            </span>
                                                            <span className="text-[9px] md:text-[10px] bg-[#333333] text-white px-2 py-0.5 rounded-md font-bold mt-1 inline-block whitespace-nowrap">
                                                                ₹{formatInr(row['Ring/Earring'].lab)} {t('labourCharge')}
                                                            </span>
                                                        </div>
                                                    ) : <span className="text-gray-200">─</span>}
                                                </td>
                                                <td className="p-3 md:p-4 border-b border-gray-100 border-r border-gray-100 text-center">
                                                    {row['Chain'] ? (
                                                        <div className="inline-flex flex-col items-center">
                                                            <span className="font-black text-gray-900 text-base md:text-lg">
                                                                {row['Chain'].waste < 1 ? row['Chain'].waste.toFixed(3) : `${row['Chain'].waste}g`}
                                                            </span>
                                                            <span className="text-[9px] md:text-[10px] bg-[#333333] text-white px-2 py-0.5 rounded-md font-bold mt-1 inline-block whitespace-nowrap">
                                                                ₹{formatInr(row['Chain'].lab)} {t('labourCharge')}
                                                            </span>
                                                        </div>
                                                    ) : <span className="text-gray-200">─</span>}
                                                </td>
                                                <td className="p-3 md:p-4 border-b border-gray-100 text-center">
                                                    {row['Haram/Necklace'] ? (
                                                        <div className="inline-flex flex-col items-center">
                                                            <span className="font-black text-gray-900 text-base md:text-lg">
                                                                {row['Haram/Necklace'].waste < 1 ? row['Haram/Necklace'].waste.toFixed(3) : `${row['Haram/Necklace'].waste}g`}
                                                            </span>
                                                            <span className="text-[9px] md:text-[10px] bg-[#333333] text-white px-2 py-0.5 rounded-md font-bold mt-1 inline-block whitespace-nowrap">
                                                                ₹{formatInr(row['Haram/Necklace'].lab)} {t('labourCharge')}
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

                        {/* Policy — rounded, with margins; only after scrolling past the table */}
                        <div className="p-6 md:p-8 bg-[#333333] rounded-2xl md:rounded-3xl text-white shadow-xl relative overflow-hidden">
                            <div className="absolute right-0 top-0 opacity-10 translate-x-1/4 -translate-y-1/4 scale-150 pointer-events-none">
                                <CalcIcon size={200} />
                            </div>
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="text-center md:text-left">
                                    <h3 className="text-lg md:text-xl uppercase text-[#D4AF37] font-heading">{t('policyNote')}</h3>
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
        </main>
    );
}
