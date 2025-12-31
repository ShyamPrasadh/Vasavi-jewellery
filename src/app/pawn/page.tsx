'use client';

import { useState, useMemo } from 'react';
import Header from '../components/Header';
import { Calculator as CalcIcon, Calendar, TrendingUp, Wallet, Plus, Trash2, Info, ChevronRight } from 'lucide-react';

interface ExtraCash {
    id: string;
    amount: string;
    date: string;
}

export default function PawnCalculatorPage() {
    const [principal, setPrincipal] = useState<string>('10000');
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [interestRate, setInterestRate] = useState<string>('2'); // 2% per month
    const [extraCash, setExtraCash] = useState<ExtraCash[]>([]);

    const addExtraCash = () => {
        setExtraCash([...extraCash, {
            id: Math.random().toString(36).substr(2, 9),
            amount: '0',
            date: new Date().toISOString().split('T')[0]
        }]);
    };

    const removeExtraCash = (id: string) => {
        setExtraCash(extraCash.filter(item => item.id !== id));
    };

    const updateExtraCash = (id: string, field: 'amount' | 'date', value: string) => {
        setExtraCash(extraCash.map(item => {
            if (item.id === id) {
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const calculations = useMemo(() => {
        const baseP = parseFloat(principal) || 0;
        const r = parseFloat(interestRate) || 0;
        const today = new Date();
        const start = new Date(startDate);

        const getMonthsBetween = (d1: Date, d2: Date) => {
            if (d1 >= d2) return 0;
            let yearDiff = d2.getFullYear() - d1.getFullYear();
            let monthDiff = d2.getMonth() - d1.getMonth();
            let dayDiff = d2.getDate() - d1.getDate();

            let totalMonths = (yearDiff * 12) + monthDiff;
            if (dayDiff < 0) {
                const prevMonth = new Date(d2.getFullYear(), d2.getMonth(), 0).getDate();
                totalMonths -= 1;
                dayDiff = prevMonth + dayDiff;
            }
            return totalMonths + (dayDiff / 30);
        };

        const baseMonths = getMonthsBetween(start, today);
        const baseInterest = (baseP * r * baseMonths) / 100;

        const extraBreakdown = extraCash.map(extra => {
            const amount = parseFloat(extra.amount) || 0;
            const extraDate = new Date(extra.date);
            const months = getMonthsBetween(extraDate, today);
            const interest = (amount * r * months) / 100;
            return {
                id: extra.id,
                amount,
                date: extra.date,
                months,
                interest
            };
        });

        const totalExtraPrincipal = extraBreakdown.reduce((sum, e) => sum + e.amount, 0);
        const totalExtraInterest = extraBreakdown.reduce((sum, e) => sum + e.interest, 0);

        const totalP = baseP + totalExtraPrincipal;
        const totalInterest = baseInterest + totalExtraInterest;
        const totalAmount = totalP + totalInterest;

        let yearDiff = today.getFullYear() - start.getFullYear();
        let monthDiff = today.getMonth() - start.getMonth();
        let dayDiff = today.getDate() - start.getDate();
        let totalMonths = (yearDiff * 12) + monthDiff;
        if (dayDiff < 0) {
            const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
            totalMonths -= 1;
            dayDiff = prevMonth + dayDiff;
        }

        return {
            basePrincipal: baseP,
            baseInterest,
            extraBreakdown,
            totalExtraPrincipal,
            totalExtraInterest,
            totalPrincipal: totalP,
            months: totalMonths,
            days: dayDiff,
            interestRate: r,
            interestAmount: totalInterest,
            totalAmount,
        };
    }, [principal, startDate, interestRate, extraCash]);

    return (
        <main className="min-h-screen bg-[#FDFCFB] pb-12">
            <Header />

            <div className="max-w-5xl mx-auto px-4 mt-8">
                {/* Navigation Tabs */}
                <div className="flex gap-2 mb-10 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-fit mx-auto">
                    <a href="/" className="px-8 py-2.5 rounded-xl text-sm font-bold text-gray-400 hover:text-gray-600 transition-all">
                        Gold Calculator
                    </a>
                    <div className="px-8 py-2.5 rounded-xl text-sm font-bold bg-[#D4AF37] text-white shadow-lg shadow-amber-200/50">
                        Pawn Interest
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {/* Principal Amount */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]"></div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Initial Principal</label>
                        <div className="relative">
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-300">₹</span>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={principal}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || /^\d*\.?\d*$/.test(val)) setPrincipal(val);
                                }}
                                className="w-full pl-8 py-2 bg-transparent border-b-2 border-gray-100 focus:border-[#D4AF37] outline-none transition-all font-bold text-2xl text-gray-800"
                            />
                        </div>
                    </div>

                    {/* Start Date */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#333333]"></div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Pawn Date (Start)</label>
                        <div className="relative">
                            <Calendar className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full pl-8 py-2 bg-transparent border-b-2 border-gray-100 focus:border-[#333333] outline-none transition-all font-bold text-xl text-gray-800 cursor-pointer appearance-none"
                                style={{ colorScheme: 'light' }}
                            />
                        </div>
                    </div>

                    {/* Interest Rate */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]"></div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Rate (% / Month)</label>
                        <div className="relative">
                            <TrendingUp className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                            <input
                                type="text"
                                inputMode="decimal"
                                value={interestRate}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || /^\d*\.?\d*$/.test(val)) setInterestRate(val);
                                }}
                                className="w-full pl-8 py-2 bg-transparent border-b-2 border-gray-100 focus:border-[#D4AF37] outline-none transition-all font-bold text-2xl text-gray-800"
                            />
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300 font-bold">%</span>
                        </div>
                    </div>
                </div>

                {/* Extra Cash Section */}
                <div className="mb-10 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                <div className="p-2 bg-amber-50 rounded-lg">
                                    <Plus size={20} className="text-[#D4AF37]" />
                                </div>
                                Extra Cash History
                            </h3>
                            <p className="text-xs text-gray-400 mt-1 ml-11 font-medium">Add additional principal amounts taken later</p>
                        </div>
                        <button
                            onClick={addExtraCash}
                            className="bg-[#333333] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-200 flex items-center gap-2"
                        >
                            <Plus size={14} />
                            Add Entry
                        </button>
                    </div>

                    {extraCash.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                            <p className="text-gray-400 italic text-sm">No extra cash entries recorded.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {extraCash.map((item) => {
                                const breakdown = calculations.extraBreakdown.find(b => b.id === item.id);
                                return (
                                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-gray-50/50 p-6 rounded-2xl border border-gray-100 hover:border-amber-200 transition-all group">
                                        <div className="md:col-span-3">
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Amount</label>
                                            <div className="relative">
                                                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    value={item.amount}
                                                    onChange={(e) => updateExtraCash(item.id, 'amount', e.target.value)}
                                                    className="w-full pl-6 py-1 bg-transparent border-b border-gray-200 focus:border-[#D4AF37] outline-none font-bold text-gray-800 text-lg"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Date Added</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                                                <input
                                                    type="date"
                                                    value={item.date}
                                                    onChange={(e) => updateExtraCash(item.id, 'date', e.target.value)}
                                                    className="w-full pl-6 py-1 bg-transparent border-b border-gray-200 focus:border-[#D4AF37] outline-none font-bold text-gray-700 cursor-pointer appearance-none"
                                                    style={{ colorScheme: 'light' }}
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 text-center">
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Duration</label>
                                            <div className="font-bold text-gray-600 text-sm bg-white py-1.5 rounded-lg border border-gray-100">
                                                {breakdown?.months.toFixed(2)} <span className="text-[10px] font-normal">mos</span>
                                            </div>
                                        </div>
                                        <div className="md:col-span-3 text-center">
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Accrued Interest</label>
                                            <div className="font-bold text-[#D4AF37] text-lg bg-white py-1 rounded-lg border border-amber-50 shadow-sm">
                                                ₹{Math.round(breakdown?.interest || 0).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="md:col-span-1 flex justify-end">
                                            <button
                                                onClick={() => removeExtraCash(item.id)}
                                                className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Interest Breakup Card */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col h-full">
                        <div className="bg-[#333333] text-white p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded-lg">
                                    <CalcIcon size={20} />
                                </div>
                                <h2 className="text-lg font-bold uppercase tracking-widest">Interest Breakup</h2>
                            </div>
                        </div>
                        <div className="p-8 flex-1 flex flex-col space-y-6">
                            {/* Initial Principal Breakdown */}
                            <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-2">
                                        <Wallet size={14} className="text-gray-400" />
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Initial Principal</span>
                                    </div>
                                    <span className="text-base font-bold text-gray-800">₹{calculations.basePrincipal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-gray-400" />
                                        <span className="text-xs text-gray-500">{calculations.months}m {calculations.days}d duration</span>
                                    </div>
                                    <span className="text-base font-bold text-[#D4AF37]">₹{Math.round(calculations.baseInterest).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Extra Cash Summary */}
                            {calculations.extraBreakdown.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 px-1">
                                        <div className="h-px flex-1 bg-gray-100"></div>
                                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Extra Cash Totals</span>
                                        <div className="h-px flex-1 bg-gray-100"></div>
                                    </div>
                                    <div className="flex justify-between items-center px-2">
                                        <span className="text-xs font-bold text-gray-500">Total Extra Principal</span>
                                        <span className="text-sm font-bold text-gray-700">₹{calculations.totalExtraPrincipal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center px-2">
                                        <span className="text-xs font-bold text-gray-500">Total Extra Interest</span>
                                        <span className="text-sm font-bold text-[#D4AF37]">₹{Math.round(calculations.totalExtraInterest).toLocaleString()}</span>
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 mt-auto border-t-2 border-dashed border-gray-100">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Principal</span>
                                    <span className="text-xl font-black text-gray-900">₹{calculations.totalPrincipal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Interest</span>
                                    <span className="text-3xl font-black text-[#D4AF37]">₹{Math.round(calculations.interestAmount).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Total Payable Card */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-amber-100/50 border border-gray-100 overflow-hidden flex flex-col h-full">
                        <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white p-6 flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <TrendingUp size={20} />
                            </div>
                            <h2 className="text-lg font-bold uppercase tracking-widest">Total Payable</h2>
                        </div>
                        <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
                            <div className="mb-8">
                                <p className="text-gray-400 uppercase text-[10px] font-black tracking-[0.2em] mb-3">Final Settlement Amount</p>
                                <div className="relative inline-block">
                                    <p className="text-6xl font-black text-gray-800 tracking-tighter">₹{Math.round(calculations.totalAmount).toLocaleString()}</p>
                                    <div className="absolute -bottom-2 left-0 w-full h-1.5 bg-[#D4AF37]/20 rounded-full"></div>
                                </div>
                            </div>

                            <div className="w-full grid grid-cols-2 gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                <div className="text-left border-r border-gray-200">
                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Principal</p>
                                    <p className="text-xl font-bold text-gray-700">₹{calculations.totalPrincipal.toLocaleString()}</p>
                                </div>
                                <div className="text-left pl-2">
                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Interest</p>
                                    <p className="text-xl font-bold text-[#D4AF37]">₹{Math.round(calculations.interestAmount).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="mt-8 p-5 bg-amber-50/50 rounded-2xl border border-amber-100/50 w-full flex items-start gap-4 text-left">
                                <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                    <Info size={14} className="text-[#D4AF37]" />
                                </div>
                                <p className="text-[11px] text-gray-600 leading-relaxed font-medium">
                                    Interest is calculated at <span className="font-bold text-gray-900">{calculations.interestRate}% per month</span>.
                                    Extra cash entries accrue interest from their respective addition dates to today.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="mt-12 text-center text-[10px] text-gray-300 font-black uppercase tracking-[0.4em]">
                    Sri Vasavi Jewellery • Professional Pawn System v1.2
                </p>
            </div>
        </main>
    );
}
