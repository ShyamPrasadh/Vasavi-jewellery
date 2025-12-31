'use client';

import { useState, useMemo } from 'react';
import Header from '../components/Header';
import { Calculator as CalcIcon, Calendar, TrendingUp, Wallet } from 'lucide-react';

export default function PawnCalculatorPage() {
    const [principal, setPrincipal] = useState<string>('10000');
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [interestRate, setInterestRate] = useState<string>('2'); // 2% per month

    const calculations = useMemo(() => {
        const p = parseFloat(principal) || 0;
        const r = parseFloat(interestRate) || 0;

        const start = new Date(startDate);
        const today = new Date();

        // Calculate difference in months and days
        let yearDiff = today.getFullYear() - start.getFullYear();
        let monthDiff = today.getMonth() - start.getMonth();
        let dayDiff = today.getDate() - start.getDate();

        let totalMonths = (yearDiff * 12) + monthDiff;

        // If today's day is less than start day, we haven't completed the current month
        // But usually interest is charged for the partial month. 
        // Let's calculate precise months (e.g. 1.5 months)
        if (dayDiff < 0) {
            // Get days in the previous month to calculate the fraction
            const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
            totalMonths -= 1;
            dayDiff = prevMonth + dayDiff;
        }

        const fractionalMonths = totalMonths + (dayDiff / 30); // Approximate 30 days per month
        const m = Math.max(0, fractionalMonths);

        const interestAmount = (p * r * m) / 100;
        const totalAmount = p + interestAmount;

        return {
            principal: p,
            months: totalMonths,
            days: dayDiff,
            displayMonths: m.toFixed(2),
            interestRate: r,
            interestAmount,
            totalAmount,
        };
    }, [principal, startDate, interestRate]);

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
                        <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Principal Amount</label>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Interest Breakup Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col h-full">
                        <div className="bg-[#333333] text-white p-4 flex items-center gap-2">
                            <CalcIcon size={20} />
                            <h2 className="text-lg font-semibold uppercase tracking-wider">Interest Breakup</h2>
                        </div>
                        <div className="p-7 pt-5 flex-1 flex flex-col justify-center space-y-6">
                            <div className="flex justify-between items-center text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Wallet size={16} className="text-gray-400" />
                                    <span>Principal Amount</span>
                                </div>
                                <span className="font-medium text-gray-900">₹{calculations.principal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-gray-400" />
                                    <span>Duration</span>
                                </div>
                                <div className="text-right">
                                    <span className="font-medium text-gray-900 block">{calculations.months} Months, {calculations.days} Days</span>
                                    <span className="text-xs text-gray-400">({calculations.displayMonths} total months)</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-gray-600 pb-4 border-b border-gray-50">
                                <div className="flex items-center gap-2">
                                    <TrendingUp size={16} className="text-gray-400" />
                                    <span>Monthly Interest ({calculations.interestRate}%)</span>
                                </div>
                                <span className="font-medium text-gray-900">₹{((calculations.principal * calculations.interestRate) / 100).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-xl font-bold text-gray-900">Total Interest</span>
                                <span className="text-2xl font-bold text-[#D4AF37]">₹{Math.round(calculations.interestAmount).toLocaleString()}</span>
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
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Principal</p>
                                        <p className="text-lg font-bold text-gray-700">₹{calculations.principal.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Interest</p>
                                        <p className="text-lg font-bold text-[#D4AF37]">₹{Math.round(calculations.interestAmount).toLocaleString()}</p>
                                    </div>
                                </div>
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
