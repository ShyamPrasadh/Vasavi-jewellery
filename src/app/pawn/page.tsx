'use client';

import { useState, useMemo } from 'react';
import Header from '../components/Header';
import { Calculator as CalcIcon, Calendar, TrendingUp, Wallet, Plus, Trash2, Info } from 'lucide-react';

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

        // Helper to calculate fractional months between two dates
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

        // 1. Calculate Base Interest (from start date to today)
        const baseMonths = getMonthsBetween(start, today);
        const baseInterest = (baseP * r * baseMonths) / 100;

        // 2. Calculate Extra Cash Interest (from each entry's date to today)
        const extraBreakdown = extraCash.map(extra => {
            const amount = parseFloat(extra.amount) || 0;
            const extraDate = new Date(extra.date);
            const months = getMonthsBetween(extraDate, today);
            const interest = (amount * r * months) / 100;
            return {
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

        // For display purposes (main duration)
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
        <main className="min-h-screen bg-gray-50 pb-12">
            <Header />

            <div className="max-w-5xl mx-auto px-4 mt-8">
                {/* Navigation Tabs */}
                <div className="flex gap-2 mb-8 bg-white p-1 rounded-xl shadow-sm border border-gray-100 w-fit mx-auto">
                    <a href="/" className="px-6 py-2 rounded-lg text-sm font-bold text-gray-500 hover:text-gray-700 transition-all">
                        Gold Calculator
                    </a>
                    <div className="px-6 py-2 rounded-lg text-sm font-bold bg-[#D4AF37] text-white shadow-md">
                        Pawn Interest
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                    {/* Principal Amount */}
                    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-[#D4AF37]">
                        <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Initial Principal</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={principal}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || /^\d*\.?\d*$/.test(val)) setPrincipal(val);
                                }}
                                className="w-full pl-10 p-2 md:p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all font-bold text-lg md:text-xl text-gray-800"
                            />
                        </div>
                    </div>

                    {/* Start Date */}
                    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-[#333333]">
                        <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Pawn Date (Start)</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full p-2 md:p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all font-bold text-lg md:text-xl text-gray-800 cursor-pointer"
                        />
                    </div>

                    {/* Interest Rate */}
                    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-[#D4AF37]">
                        <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Interest Rate (% / Month)</label>
                        <div className="relative">
                            <input
                                type="text"
                                inputMode="decimal"
                                value={interestRate}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || /^\d*\.?\d*$/.test(val)) setInterestRate(val);
                                }}
                                className="w-full p-2 md:p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent outline-none transition-all font-bold text-lg md:text-xl text-gray-800"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                        </div>
                    </div>
                </div>

                {/* Extra Cash Section */}
                <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                            <Plus size={20} className="text-[#D4AF37]" />
                            Extra Cash (Additional Principal)
                        </h3>
                        <button
                            onClick={addExtraCash}
                            className="bg-[#D4AF37] text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#B8860B] transition-all shadow-sm"
                        >
                            Add Extra Cash
                        </button>
                    </div>

                    {extraCash.length === 0 ? (
                        <p className="text-center text-gray-400 py-4 italic text-sm">No extra cash added yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {extraCash.map((item) => (
                                <div key={item.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={item.amount}
                                                onChange={(e) => updateExtraCash(item.id, 'amount', e.target.value)}
                                                className="w-full pl-7 p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none font-bold text-gray-800"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Date Added</label>
                                        <input
                                            type="date"
                                            value={item.date}
                                            onChange={(e) => updateExtraCash(item.id, 'date', e.target.value)}
                                            className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4AF37] outline-none font-bold text-gray-800 cursor-pointer"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeExtraCash(item.id)}
                                        className="bg-red-50 text-red-500 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all w-fit md:mb-1"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Interest Breakup Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-full">
                        <div className="bg-[#333333] text-white p-4 flex items-center gap-2">
                            <CalcIcon size={20} />
                            <h2 className="text-lg font-semibold uppercase tracking-wider">Interest Breakup</h2>
                        </div>
                        <div className="p-7 pt-5 flex-1 flex flex-col space-y-4">
                            {/* Initial Principal Breakdown */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Initial Principal</span>
                                    <span className="text-sm font-bold text-gray-800">₹{calculations.basePrincipal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">Interest ({calculations.months}m {calculations.days}d)</span>
                                    <span className="text-sm font-bold text-[#D4AF37]">₹{Math.round(calculations.baseInterest).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Extra Cash Breakdown */}
                            {calculations.extraBreakdown.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Extra Cash Breakdown</p>
                                    {calculations.extraBreakdown.map((extra, idx) => (
                                        <div key={idx} className="bg-amber-50/30 p-3 rounded-xl border border-amber-100/50">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-bold text-gray-600">₹{extra.amount.toLocaleString()} <span className="text-[10px] font-normal text-gray-400">({extra.date})</span></span>
                                                <span className="text-xs font-bold text-[#D4AF37]">+ ₹{Math.round(extra.interest).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] text-gray-400 italic">{extra.months.toFixed(2)} months duration</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="pt-4 mt-auto border-t border-gray-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-gray-600">Total Principal</span>
                                    <span className="text-sm font-bold text-gray-900">₹{calculations.totalPrincipal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-gray-900">Total Interest</span>
                                    <span className="text-2xl font-bold text-[#D4AF37]">₹{Math.round(calculations.interestAmount).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Total Payable Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-full">
                        <div className="bg-[#D4AF37] text-white p-4 flex items-center gap-2">
                            <TrendingUp size={20} />
                            <h2 className="text-lg font-semibold uppercase tracking-wider">Total Payable</h2>
                        </div>
                        <div className="p-7 flex-1 flex flex-col items-center justify-center text-center">
                            <p className="text-gray-500 uppercase text-xs font-bold tracking-widest mb-2">Total Amount (Principal + Interest)</p>
                            <p className="text-5xl font-black text-gray-800 mb-4">₹{Math.round(calculations.totalAmount).toLocaleString()}</p>
                            <div className="w-full pt-6 border-t border-gray-100">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total Principal</p>
                                        <p className="text-lg font-bold text-gray-700">₹{calculations.totalPrincipal.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total Interest</p>
                                        <p className="text-lg font-bold text-[#D4AF37]">₹{Math.round(calculations.interestAmount).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100 w-full flex items-start gap-3 text-left">
                                <Info size={16} className="text-[#D4AF37] mt-0.5 shrink-0" />
                                <p className="text-[10px] text-gray-500 leading-relaxed">
                                    Interest is calculated at <span className="font-bold text-gray-700">{calculations.interestRate}% per month</span>.
                                    Extra cash entries accrue interest from their respective addition dates to today.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-xs text-gray-400 font-medium uppercase tracking-[0.3em] opacity-50">
                    Professional Pawn Management System v1.0
                </p>
            </div>
        </main>
    );
}
