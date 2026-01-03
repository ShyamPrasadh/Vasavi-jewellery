'use client';

import { useState, useMemo, useEffect } from 'react';
import Header from '../components/Header';
import { useGoldRates } from '@/hooks/useGoldRates';
import CustomDatePicker from '../components/CustomDatePicker';
import { Calculator as CalcIcon, Calendar, TrendingUp, Wallet, Plus, Trash2, Info, Printer, Download, X, Percent } from 'lucide-react';
import Link from 'next/link';

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
    const [showPrintModal, setShowPrintModal] = useState(false);
    const { rates, isSyncing } = useGoldRates();

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (showPrintModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [showPrintModal]);

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

        // Combine all entries for the print table
        const allEntries = [
            {
                date: startDate,
                amount: baseP,
                rate: r,
                months: baseMonths,
                interest: baseInterest,
                label: 'Initial Principal'
            },
            ...extraBreakdown.map(e => ({
                date: e.date,
                amount: e.amount,
                rate: r,
                months: e.months,
                interest: e.interest,
                label: 'Extra Cash'
            }))
        ];

        return {
            totalPrincipal: totalP,
            interestAmount: totalInterest,
            totalAmount,
            allEntries,
            extraBreakdown,
            todayDate: today.toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }).toUpperCase()
        };
    }, [principal, startDate, interestRate, extraCash]);

    const handlePrint = () => {
        window.print();
    };

    const rates_legacy = { k22: 7520, k24: 8200 }; // Still kept for fallback or legacy if needed

    return (
        <main className="min-h-screen bg-[#FDFCFB] pb-12">
            <Header rates={rates || undefined} />

            <div className="max-w-5xl mx-auto px-4 mt-8">
                {/* Modern Navigation Toggle */}
                <div className="flex justify-center mb-12">
                    <div className="relative bg-gray-100 p-1 rounded-2xl flex w-full max-w-[400px]">
                        <div
                            className="absolute top-1 bottom-1 transition-all duration-300 ease-out bg-white rounded-xl shadow-md"
                            style={{
                                left: '50%',
                                right: '1px',
                                width: 'calc(50% - 2px)'
                            }}
                        />
                        <Link
                            href="/"
                            className="relative flex-1 py-3 text-sm font-black text-center z-10 transition-colors text-gray-400 hover:text-gray-600"
                        >
                            GOLD CALCULATOR
                        </Link>
                        <div className="relative flex-1 py-3 text-sm font-black text-center z-10 text-[#D4AF37]">
                            PAWN INTEREST
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-10">
                    {/* Principal Amount Card */}
                    <div className="col-span-2 md:col-span-1 bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]"></div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Principal Amount</label>
                        <div className="relative">
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-300">₹</span>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={principal}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || /^\d*\.?\d*$/.test(val)) setPrincipal(val);
                                }}
                                className="w-full pl-6 py-2 bg-transparent border-b-2 border-gray-100 focus:border-[#D4AF37] outline-none transition-all font-bold text-lg text-gray-800"
                            />
                        </div>
                    </div>

                    {/* Pawn Date Card */}
                    <div className="col-span-1 bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative group overflow-visible">
                        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]"></div>
                        </div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Pawn Date</label>
                        <div className="relative w-full overflow-visible">
                            <CustomDatePicker
                                selected={startDate ? new Date(parseInt(startDate.split('-')[0]), parseInt(startDate.split('-')[1]) - 1, parseInt(startDate.split('-')[2])) : null}
                                onChange={(date) => {
                                    if (date) {
                                        const dateString = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
                                        setStartDate(dateString);
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Interest Rate Card */}
                    <div className="col-span-1 bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]"></div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Monthly Interest Rate</label>
                        <div className="relative flex items-center">
                            <Percent size={16} className="absolute left-0 text-gray-300" />
                            <input
                                type="text"
                                inputMode="decimal"
                                value={interestRate}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || /^\d*\.?\d*$/.test(val)) setInterestRate(val);
                                }}
                                className="w-full pl-6 py-2 bg-transparent border-b-2 border-gray-100 focus:border-[#D4AF37] outline-none transition-all font-bold text-lg text-gray-800"
                            />
                            <span className="absolute right-0 text-gray-300 font-bold">%</span>
                        </div>
                    </div>
                </div>

                {/* Extra Cash Section */}
                <div className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 px-2 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] shrink-0 font-black text-lg">
                                ₹
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-gray-800 uppercase tracking-wider">Extra Cash</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Add additional principal entries</p>
                            </div>
                        </div>
                        <button
                            onClick={addExtraCash}
                            className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#333333] text-white px-6 py-3 rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200 text-[10px] font-black uppercase tracking-widest"
                        >
                            <Plus size={14} />
                            Add Entry
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {extraCash.map((cash) => (
                            <div key={cash.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative group animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]"></div>
                                </div>
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex-1 grid grid-cols-2 gap-4 items-end">
                                        <div className="flex flex-col h-full">
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Amount</label>
                                            <div className="relative mt-auto">
                                                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 font-bold">₹</span>
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    value={cash.amount}
                                                    onChange={(e) => updateExtraCash(cash.id, 'amount', e.target.value)}
                                                    className="w-full pl-4 py-2 bg-transparent border-b-2 border-gray-100 focus:border-[#D4AF37] outline-none transition-all font-bold text-base text-gray-800"
                                                />
                                            </div>
                                        </div>
                                        <div className="overflow-visible">
                                            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Date Added</label>
                                            <CustomDatePicker
                                                align="right"
                                                selected={cash.date ? new Date(parseInt(cash.date.split('-')[0]), parseInt(cash.date.split('-')[1]) - 1, parseInt(cash.date.split('-')[2])) : null}
                                                onChange={(date) => {
                                                    if (date) {
                                                        const dateString = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
                                                        updateExtraCash(cash.id, 'date', dateString);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeExtraCash(cash.id)}
                                        className="ml-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                {/* Mini breakdown for this entry */}
                                <div className="flex items-center justify-between pt-4 border-t border-dashed border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={12} className="text-gray-300" />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            {calculations.extraBreakdown.find(b => b.id === cash.id)?.months.toFixed(2)}m duration
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Interest:</span>
                                        <span className="text-sm font-black text-[#D4AF37]">
                                            ₹{Math.round(calculations.extraBreakdown.find(b => b.id === cash.id)?.interest || 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {extraCash.length === 0 && (
                            <div className="md:col-span-2 py-12 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                                <Wallet size={48} className="mb-4 text-gray-300" />
                                <p className="text-sm font-bold uppercase tracking-widest">No extra cash entries added yet</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 print:hidden">
                    {/* Interest Breakup Card */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col h-full">
                        <div className="bg-[#333333] text-white px-4 py-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CalcIcon size={16} />
                                <h2 className="text-xs font-bold uppercase tracking-wider">Interest Breakup</h2>
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="text-xs text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                            <th className="pb-3 font-black">Principal</th>
                                            <th className="pb-3 font-black">Rate</th>
                                            <th className="pb-3 font-black">Duration</th>
                                            <th className="pb-3 font-black text-right">Interest</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {calculations.allEntries.map((entry, idx) => (
                                            <tr key={idx} className="group/row">
                                                <td className="py-3 font-bold text-gray-800">₹{entry.amount.toLocaleString()}</td>
                                                <td className="py-3 text-gray-500 font-medium">{entry.rate}%</td>
                                                <td className="py-3 text-gray-500 font-medium">{entry.months.toFixed(2)}m</td>
                                                <td className="py-3 font-bold text-[#D4AF37] text-right">₹{Math.round(entry.interest).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="pt-3 mt-auto border-t-2 border-dashed border-gray-100">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Total Principal</span>
                                    <span className="text-sm font-black text-gray-900">₹{calculations.totalPrincipal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Total Interest</span>
                                    <span className="text-lg md:text-xl font-black text-[#D4AF37]">₹{Math.round(calculations.interestAmount).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Total Payable Card */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-amber-100/50 border border-gray-100 overflow-hidden flex flex-col h-full">
                        <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white px-4 py-2.5 flex items-center gap-2">
                            <TrendingUp size={16} />
                            <h2 className="text-xs font-bold uppercase tracking-wider">Total Payable</h2>
                        </div>
                        <div className="p-4 flex-1 flex flex-col items-center justify-center text-center">
                            <div className="mb-3">
                                <p className="text-gray-400 uppercase text-[8px] font-black tracking-[0.2em] mb-1">Final Settlement Amount</p>
                                <div className="relative inline-block">
                                    <p className="text-xl md:text-2xl font-black text-gray-800 tracking-tighter">₹{Math.round(calculations.totalAmount).toLocaleString()}</p>
                                    <div className="absolute -bottom-1 left-0 w-full h-1 bg-[#D4AF37]/20 rounded-full"></div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full max-w-[180px] mb-4">
                                <div>
                                    <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1">Principal</p>
                                    <p className="text-sm font-bold text-gray-800">₹{calculations.totalPrincipal.toLocaleString()}</p>
                                </div>
                                <div className="border-l border-gray-100">
                                    <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1">Interest</p>
                                    <p className="text-sm font-bold text-[#D4AF37]">₹{Math.round(calculations.interestAmount).toLocaleString()}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowPrintModal(true)}
                                className="w-full bg-[#333333] text-white py-4 rounded-2xl hover:bg-black hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-gray-900/30 flex items-center justify-center gap-3 font-black uppercase tracking-[0.15em] text-sm"
                            >
                                <Printer size={18} className="text-[#D4AF37]" />
                                View & Print
                            </button>

                            <div className="mt-3 flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                                <Info size={10} className="text-[#D4AF37]" />
                                <p className="text-[8px] font-bold text-amber-800 uppercase tracking-widest">
                                    Interest is calculated at {interestRate}% per month.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="mt-12 text-center text-[10px] text-gray-300 font-black uppercase tracking-[0.4em] print:hidden">
                    Sri Vasavi Jewellery
                </p>
            </div>

            {/* Print Modal */}
            {showPrintModal && (
                <div id="print-modal-root" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:static print:bg-white print:p-0">
                    <div className="bg-white w-fit max-w-[calc(100vw-2rem)] md:w-full md:max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:max-h-none print:rounded-none">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center print:hidden">
                            <h3 className="text-lg font-bold text-gray-800">Print Preview</h3>
                            <div className="flex gap-3">
                                <button
                                    onClick={handlePrint}
                                    className="bg-[#D4AF37] text-white px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-[#B8860B]"
                                >
                                    <Download size={14} />
                                    Download / Print
                                </button>
                                <button
                                    onClick={() => setShowPrintModal(false)}
                                    className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Printable Content */}
                        <div className="px-8 py-4 md:px-12 md:py-6 overflow-y-auto print:overflow-visible print:p-0" id="printable-area">

                            {/* ===== SCREEN PREVIEW ===== */}
                            <div className="print:hidden">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Date of Calculation</p>
                                        <p className="text-sm font-bold text-gray-800">{calculations.todayDate.split(',')[0]}</p>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-50 pb-2">Calculation Breakdown</h4>
                                    <table className="w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="text-[10px] text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50/50">
                                                <th className="p-3 font-black text-left">Date Added</th>
                                                <th className="p-3 font-black text-left">Principal Amount</th>
                                                <th className="p-3 font-black text-left">Rate (%)</th>
                                                <th className="p-3 font-black text-left">Duration (Mos)</th>
                                                <th className="p-3 font-black text-right">Interest Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {calculations.allEntries.map((entry, idx) => (
                                                <tr key={idx}>
                                                    <td className="p-3 text-gray-600 font-medium">
                                                        {new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td className="p-3 font-bold text-gray-800">₹{entry.amount.toLocaleString()}</td>
                                                    <td className="p-3 text-gray-600">{entry.rate}%</td>
                                                    <td className="p-3 text-gray-600">{entry.months.toFixed(2)}</td>
                                                    <td className="p-3 font-bold text-[#D4AF37] text-right">₹{Math.round(entry.interest).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Principal</span>
                                        <span className="text-base font-bold text-gray-900">₹{calculations.totalPrincipal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Interest</span>
                                        <span className="text-base font-bold text-[#D4AF37]">₹{Math.round(calculations.interestAmount).toLocaleString()}</span>
                                    </div>
                                    <div className="mt-8 pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
                                        <span className="text-sm font-black text-gray-800 uppercase tracking-widest">Total Payable</span>
                                        <span className="text-xl font-black text-[#D4AF37]">₹{Math.round(calculations.totalAmount).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* ===== PRINT ONLY BILL ===== */}
                            <div className="hidden print:block" style={{ fontFamily: 'Arial, sans-serif', fontSize: '11pt', color: '#000', maxWidth: '650pt', margin: '0 auto', padding: '20pt' }}>

                                {/* Header */}
                                <div style={{ textAlign: 'center', marginBottom: '40pt' }}>
                                    <h1 className="font-serif-gold" style={{ fontSize: '28pt', margin: '0', color: '#D4AF37' }}>Sri Vasavi Jewellery</h1>
                                </div>

                                {/* Header Row: Gold Loan Summary (left) and Date of Calculation (right) */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30pt' }}>
                                    <div>
                                        <div style={{ fontSize: '9pt', color: '#999', textTransform: 'uppercase', letterSpacing: '1pt', marginBottom: '6pt' }}>Gold Loan Summary</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '9pt', color: '#999', textTransform: 'uppercase', letterSpacing: '1pt', marginBottom: '6pt' }}>Date of Calculation</div>
                                        <div style={{ fontSize: '13pt', fontWeight: 'bold', color: '#333' }}>
                                            {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>

                                {/* Principal Breakdown Header */}
                                <div style={{ fontSize: '9pt', color: '#999', textTransform: 'uppercase', letterSpacing: '1pt', marginBottom: '16pt' }}>
                                    Principal Breakdown
                                </div>

                                {/* Table */}
                                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30pt' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1pt solid #ddd' }}>
                                            <th style={{ padding: '10pt 8pt', textAlign: 'left', fontSize: '9pt', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5pt' }}>Date Added</th>
                                            <th style={{ padding: '10pt 8pt', textAlign: 'left', fontSize: '9pt', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5pt' }}>Principal Amount</th>
                                            <th style={{ padding: '10pt 8pt', textAlign: 'left', fontSize: '9pt', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5pt' }}>Rate (%)</th>
                                            <th style={{ padding: '10pt 8pt', textAlign: 'left', fontSize: '9pt', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5pt' }}>Duration (Mos)</th>
                                            <th style={{ padding: '10pt 8pt', textAlign: 'right', fontSize: '9pt', fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5pt' }}>Interest Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {calculations.allEntries.map((entry, idx) => (
                                            <tr key={idx} style={{ borderBottom: idx < calculations.allEntries.length - 1 ? '1pt solid #f0f0f0' : 'none' }}>
                                                <td style={{ padding: '14pt 8pt', fontSize: '11pt', color: '#333' }}>
                                                    {new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td style={{ padding: '14pt 8pt', fontSize: '11pt', fontWeight: '500', color: '#333' }}>₹{entry.amount.toLocaleString()}</td>
                                                <td style={{ padding: '14pt 8pt', fontSize: '11pt', color: '#333' }}>{entry.rate}%</td>
                                                <td style={{ padding: '14pt 8pt', fontSize: '11pt', color: '#333' }}>{entry.months.toFixed(2)}</td>
                                                <td style={{ padding: '14pt 8pt', fontSize: '11pt', fontWeight: '600', color: '#D4AF37', textAlign: 'right' }}>₹{Math.round(entry.interest).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Totals */}
                                <div style={{ marginTop: '30pt', marginBottom: '30pt' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10pt 8pt', borderBottom: '1pt solid #f0f0f0' }}>
                                        <span style={{ fontSize: '11pt', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5pt' }}>Total Principal</span>
                                        <span style={{ fontSize: '12pt', fontWeight: 'bold', color: '#333' }}>₹{calculations.totalPrincipal.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10pt 8pt', borderBottom: '1pt solid #f0f0f0' }}>
                                        <span style={{ fontSize: '11pt', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5pt' }}>Total Interest</span>
                                        <span style={{ fontSize: '12pt', fontWeight: 'bold', color: '#D4AF37' }}>₹{Math.round(calculations.interestAmount).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16pt 8pt 0 8pt', marginTop: '10pt' }}>
                                        <span style={{ fontSize: '13pt', fontWeight: 'bold', color: '#333', textTransform: 'uppercase', letterSpacing: '0.5pt' }}>Total Payable</span>
                                        <span style={{ fontSize: '16pt', fontWeight: 'bold', color: '#D4AF37' }}>₹{Math.round(calculations.totalAmount).toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div style={{ textAlign: 'center', marginTop: '60pt', paddingTop: '20pt', borderTop: '1pt solid #f0f0f0' }}>
                                    <p style={{ fontSize: '9pt', color: '#999', fontStyle: 'italic', margin: '0' }}>This is a computer-generated calculation summary for Sri Vasavi Jewellery.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0;
                    }
                    body {
                        background: white !important;
                        margin: 15mm !important;
                        padding: 0 !important;
                    }
                    /* Hide everything by default */
                    body > * {
                        display: none !important;
                    }
                    /* ONLY show the main container that holds our modal */
                    body > main {
                        display: block !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    /* Hide all children of main except the modal */
                    main > * {
                        display: none !important;
                    }
                    main > #print-modal-root {
                        display: block !important;
                    }
                    /* Hide modal header/buttons in print */
                    .print-hidden, button, .modal-header {
                        display: none !important;
                    }
                    #printable-area {
                        display: block !important;
                        position: relative !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                }
            `}</style>
        </main>
    );
}
