'use client';

import { useState, useMemo, useEffect } from 'react';
import Header from '../components/Header';
import { useGoldRates } from '@/hooks/useGoldRates';
import CustomDatePicker from '../components/CustomDatePicker';
import {
    Calculator as CalcIcon, Calendar, TrendingUp, Wallet, Plus, Trash2,
    Info, Printer, Download, X, Percent, List, User, Phone,
    Shield, MapPin, Box, Briefcase, ChevronRight, Store
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

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
    const { t } = useLanguage();

    // Pawn Shop Mode States
    const [isShopMode, setIsShopMode] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAadhaar, setCustomerAadhaar] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [productType, setProductType] = useState('Earring');
    const [returnDate, setReturnDate] = useState<string>(new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]);

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
        if (field === 'amount' && value !== '' && !/^\d*$/.test(value)) return;
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

        const diffTime = Math.abs(today.getTime() - start.getTime());
        const baseMonths = diffTime / (1000 * 60 * 60 * 24 * 30.44);
        const baseInterest = baseP * (r / 100) * baseMonths;

        const extraBreakdown = extraCash.map(cash => {
            const amt = parseFloat(cash.amount) || 0;
            const cashDate = new Date(cash.date);
            const dTime = Math.abs(today.getTime() - cashDate.getTime());
            const mos = dTime / (1000 * 60 * 60 * 24 * 30.44);
            const interest = amt * (r / 100) * mos;
            return { id: cash.id, amount: amt, months: mos, interest, date: cash.date, rate: r };
        });

        const totalPrincipal = baseP + extraCash.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
        const totalInterest = baseInterest + extraBreakdown.reduce((acc, curr) => acc + curr.interest, 0);

        const allEntries = [
            { date: startDate, amount: baseP, rate: r, months: baseMonths, interest: baseInterest },
            ...extraBreakdown.map(b => ({ date: b.date, amount: b.amount, rate: b.rate, months: b.months, interest: b.interest }))
        ];

        return {
            totalPrincipal,
            interestAmount: totalInterest,
            totalAmount: totalPrincipal + totalInterest,
            extraBreakdown,
            allEntries,
            todayDate: today.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        };
    }, [principal, startDate, interestRate, extraCash]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <main className="min-h-screen bg-[#FDFCFB] pb-32">
            <Header rates={rates || undefined} />

            <div className="max-w-5xl mx-auto px-4 mt-8">
                {/* Mode Toggle & Navigation */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                    <div className="relative bg-gray-100 p-1 rounded-2xl flex w-full max-w-[400px]">
                        <Link
                            href="/"
                            className="flex-1 py-3 text-sm font-black text-center z-10 transition-colors text-gray-400 hover:text-gray-600"
                        >
                            {t('goldCalculator')}
                        </Link>
                        <div className="flex-1 py-3 text-sm font-black text-center z-10 text-[#D4AF37] bg-white rounded-xl shadow-sm border border-gray-100/50">
                            {t('pawnInterest')}
                        </div>
                    </div>

                    <div className="flex items-center bg-gray-100 p-1 rounded-2xl w-full max-w-[320px]">
                        <button
                            onClick={() => setIsShopMode(false)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isShopMode
                                ? 'bg-white text-gray-800 shadow-sm'
                                : 'text-gray-400 hover:text-gray-500'
                                }`}
                        >
                            <CalcIcon size={14} />
                            {t('calculatorMode')}
                        </button>
                        <button
                            onClick={() => setIsShopMode(true)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isShopMode
                                ? 'bg-[#D4AF37] text-white shadow-sm'
                                : 'text-gray-400 hover:text-gray-500'
                                }`}
                        >
                            <Store size={14} />
                            {t('shopMode')}
                        </button>
                    </div>
                </div>

                {isShopMode ? (
                    /* Pawn Shop Management View - Refactored */
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-500 max-w-4xl mx-auto">
                        {/* Customer Details Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 pb-3 border-b-2 border-[#D4AF37]/20">
                                <div className="p-2 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37]">
                                    <User size={20} />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">{t('customerDetails')}</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-600 uppercase tracking-widest block ml-1">{t('fullName')}</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                                            placeholder="Enter Full Name"
                                            className="w-full pl-12 pr-4 py-4.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] outline-none transition-all font-bold text-lg text-gray-800 shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-600 uppercase tracking-widest block ml-1">{t('phoneNumber')}</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="tel"
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            placeholder="Enter Phone Number"
                                            className="w-full pl-12 pr-4 py-4.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] outline-none transition-all font-bold text-lg text-gray-800 shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-600 uppercase tracking-widest block ml-1">{t('aadhaarNumber')}</label>
                                <div className="relative">
                                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={customerAadhaar}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                                            const formatted = val.replace(/(\d{4})(?=\d)/g, '$1 ');
                                            setCustomerAadhaar(formatted);
                                        }}
                                        placeholder="0000 0000 0000"
                                        className="w-full pl-12 pr-4 py-4.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] outline-none transition-all font-bold text-lg text-gray-800 shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-600 uppercase tracking-widest block ml-1">{t('address')}</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-5 text-gray-400" size={18} />
                                    <textarea
                                        rows={3}
                                        value={customerAddress}
                                        onChange={(e) => setCustomerAddress(e.target.value)}
                                        placeholder="Enter Full Address"
                                        className="w-full pl-12 pr-4 py-4.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] outline-none transition-all font-bold text-lg text-gray-800 resize-none shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Asset & Loan Details Section */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 pb-3 border-b-2 border-[#D4AF37]/20">
                                <div className="p-2 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37]">
                                    <Box size={20} />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">{t('assetDetails')}</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-600 uppercase tracking-widest block ml-1">{t('loanAmount')}</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#D4AF37] text-lg">₹</span>
                                        <input
                                            type="text"
                                            value={principal}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                setPrincipal(val);
                                            }}
                                            className="w-full pl-12 pr-4 py-4.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] outline-none transition-all font-bold text-lg text-gray-800 shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-600 uppercase tracking-widest block ml-1">{t('productType')}</label>
                                    <div className="relative">
                                        <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <select
                                            value={productType}
                                            onChange={(e) => setProductType(e.target.value)}
                                            className="w-full pl-12 pr-10 py-4.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] outline-none transition-all font-bold text-lg text-gray-800 appearance-none cursor-pointer shadow-sm"
                                        >
                                            {['Earring', 'Coin', 'Ring', 'Necklace', 'Haram', 'Chain'].map(item => (
                                                <option key={item} value={item}>{item}</option>
                                            ))}
                                        </select>
                                        <ChevronRight size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-600 uppercase tracking-widest block ml-1">{t('loanDate')}</label>
                                    <CustomDatePicker
                                        className="pl-6"
                                        selected={new Date(startDate)}
                                        onChange={(date) => {
                                            if (date) {
                                                const dateString = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
                                                setStartDate(dateString);
                                            }
                                        }}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-600 uppercase tracking-widest block ml-1">{t('returnDateLabel')}</label>
                                    <CustomDatePicker
                                        selected={new Date(returnDate)}
                                        onChange={(date) => {
                                            if (date) {
                                                const dateString = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
                                                setReturnDate(dateString);
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button Section */}
                        <div className="pt-8">
                            <button className="w-full bg-[#333333] hover:bg-black text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 transition-all flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 text-sm">
                                <Store size={22} className="text-[#D4AF37]" />
                                {t('submitPawn')}
                            </button>
                        </div>

                        <div className="text-center py-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em]">{t('sriVasaviJewellery')}</p>
                        </div>
                    </div>
                ) : (
                    /* Existing Pawn Calculator View */
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">
                            {/* Loan Amount Card */}
                            <div className="col-span-1 bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]"></div>
                                <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-3">{t('loanAmount')}</label>
                                <div className="relative h-[40px] flex items-center">
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">₹</span>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={principal}
                                        onFocus={(e) => { if (principal === '0') setPrincipal(''); }}
                                        onBlur={(e) => { if (principal === '') setPrincipal('0'); }}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            setPrincipal(val);
                                        }}
                                        className="w-full pl-8 py-2 bg-transparent border-b-2 border-gray-100 focus:border-[#D4AF37] outline-none transition-all font-bold text-lg text-gray-800 leading-none h-full"
                                    />
                                </div>
                            </div>

                            {/* Pawn Date Card */}
                            <div className="col-span-1 bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative group overflow-visible">
                                <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]"></div>
                                </div>
                                <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-3">{t('loanDate')}</label>
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
                                <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-3">{t('monthlyInterestRate')}</label>
                                <div className="relative h-[40px] flex items-center">
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500">
                                        <Percent size={14} />
                                    </span>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={interestRate}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === '' || /^\d*\.?\d*$/.test(val)) setInterestRate(val);
                                        }}
                                        className="w-full pl-8 py-2 bg-transparent border-b-2 border-gray-100 focus:border-[#D4AF37] outline-none transition-all font-bold text-lg text-gray-800 leading-none h-full"
                                    />
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
                                        <h3 className="text-lg font-black text-gray-800 uppercase tracking-wider">{t('additionalLoans')}</h3>
                                        <p className="text-[11px] text-gray-600 font-bold uppercase tracking-widest">{t('addEntry')}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={addExtraCash}
                                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#333333] text-white px-6 py-3 rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200 text-[11px] font-black uppercase tracking-widest"
                                >
                                    <Plus size={14} />
                                    {t('addEntry')}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {extraCash.map((cash) => (
                                    <div key={cash.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative group animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37]"></div>
                                        </div>
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="flex flex-col">
                                                    <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-3">{t('loanAmount')}</label>
                                                    <div className="relative h-[40px] flex items-center">
                                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-600 font-bold text-sm">₹</span>
                                                        <input
                                                            type="text"
                                                            inputMode="decimal"
                                                            value={cash.amount}
                                                            onFocus={(e) => { if (cash.amount === '0') updateExtraCash(cash.id, 'amount', ''); }}
                                                            onBlur={(e) => { if (cash.amount === '') updateExtraCash(cash.id, 'amount', '0'); }}
                                                            onChange={(e) => updateExtraCash(cash.id, 'amount', e.target.value.replace(/\D/g, ''))}
                                                            className="w-full pl-8 py-2 bg-transparent border-b-2 border-gray-100 focus:border-[#D4AF37] outline-none transition-all font-bold text-lg text-gray-800 leading-none h-full"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-3">{t('loanDate')}</label>
                                                    <CustomDatePicker
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
                                                className="ml-4 p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        {/* Mini breakdown for this entry */}
                                        <div className="flex items-center justify-between pt-4 border-t border-dashed border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={12} className="text-gray-600" />
                                                <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">
                                                    {t('durationMonths', { months: calculations.extraBreakdown.find(b => b.id === cash.id)?.months.toFixed(2) || '0.00' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">{t('interest')}:</span>
                                                <span className="text-sm font-black text-[#D4AF37]">
                                                    ₹{Math.round(calculations.extraBreakdown.find(b => b.id === cash.id)?.interest || 0).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {extraCash.length === 0 && (
                                    <div className="md:col-span-2 py-12 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-500 bg-gray-50/50">
                                        <Wallet size={48} className="mb-4 text-gray-500" />
                                        <p className="text-sm font-bold uppercase tracking-widest">{t('noExtraEntries')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="print:hidden space-y-8 mt-10">
                            {/* Combined Summary & Settlement Card */}
                            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col">
                                <div className="bg-[#333333] text-white px-6 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <CalcIcon size={20} className="text-[#D4AF37]" />
                                        <h2 className="text-base font-black uppercase tracking-widest text-white">{t('loanSummarySettlement')}</h2>
                                    </div>
                                    <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/5">
                                        <Info size={12} className="text-[#D4AF37]" />
                                        <span className="text-[10px] uppercase font-bold tracking-tight">{t('rateMonth', { rate: interestRate })}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                                    {/* Detailed Breakdown Section */}
                                    <div className="lg:col-span-3 p-6">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm border-collapse">
                                                <thead>
                                                    <tr className="text-xs text-gray-600 uppercase tracking-widest border-b border-gray-50 bg-gray-50/50">
                                                        <th className="p-3 font-black">{t('principal')}</th>
                                                        <th className="p-3 font-black">{t('rate')}</th>
                                                        <th className="p-3 font-black">{t('duration')}</th>
                                                        <th className="p-3 font-black text-right">{t('interest')}</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {calculations.allEntries.map((entry, idx) => (
                                                        <tr key={idx} className="group/row hover:bg-gray-50/50 transition-colors">
                                                            <td className="p-3 font-bold text-gray-800">₹{entry.amount.toLocaleString()}</td>
                                                            <td className="p-3 text-gray-500 font-medium">{entry.rate}%</td>
                                                            <td className="p-3 text-gray-500 font-medium">{entry.months.toFixed(2)}m</td>
                                                            <td className="p-3 font-bold text-[#D4AF37] text-right">₹{Math.round(entry.interest).toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Final Settlement Section */}
                                    <div className="lg:col-span-2 p-6 bg-[#FDFCFB]">
                                        <h4 className="text-[11px] font-black text-gray-600 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <Wallet size={14} className="text-gray-500" />
                                            {t('finalSettlement')}
                                        </h4>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
                                                <span className="text-xs font-black text-gray-600 uppercase tracking-widest">{t('totalPrincipal')}</span>
                                                <span className="text-sm font-black text-gray-800">₹{calculations.totalPrincipal.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
                                                <span className="text-xs font-black text-gray-600 uppercase tracking-widest">{t('totalInterest')}</span>
                                                <span className="text-sm font-black text-[#D4AF37]">₹{Math.round(calculations.interestAmount).toLocaleString()}</span>
                                            </div>
                                            <div className="pt-4 flex flex-col items-center justify-center p-5 bg-white rounded-2xl border border-gray-100 relative group overflow-hidden">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-[#D4AF37] rounded-l-2xl"></div>
                                                <p className="text-gray-500 uppercase text-[11px] font-black tracking-[0.2em] mb-1">{t('totalPayable')}</p>
                                                <div className="relative inline-block">
                                                    <p className="text-3xl font-black text-gray-800 tracking-tighter">₹{Math.round(calculations.totalAmount).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setShowPrintModal(true)}
                                            className="w-full bg-[#D4AF37] text-white py-4 rounded-2xl hover:bg-[#B8860B] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 font-black uppercase tracking-[0.15em] text-sm mb-4"
                                        >
                                            <Printer size={18} />
                                            {t('printBill')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <p className="mt-12 text-center text-[10px] text-gray-300 font-black uppercase tracking-[0.4em] print:hidden">
                            {t('sriVasaviJewellery')}
                        </p>
                    </div>
                )}
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

                        <div className="px-8 py-4 md:px-12 md:py-6 overflow-y-auto print:overflow-visible print:p-0" id="printable-area">
                            {/* Printable bill content */}
                            <div style={{ textAlign: 'center', marginBottom: '40pt' }}>
                                <h1 className="font-serif-gold" style={{ fontSize: '28pt', margin: '0', color: '#D4AF37' }}>{t('sriVasaviJewellery')}</h1>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-gray-100">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('totalPrincipal')}</span>
                                    <span className="text-base font-bold text-gray-900">₹{calculations.totalPrincipal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t('totalInterest')}</span>
                                    <span className="text-base font-bold text-[#D4AF37]">₹{Math.round(calculations.interestAmount).toLocaleString()}</span>
                                </div>
                                <div className="mt-8 pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
                                    <span className="text-sm font-black text-gray-800 uppercase tracking-widest">{t('totalPayable')}</span>
                                    <span className="text-xl font-black text-[#D4AF37]">₹{Math.round(calculations.totalAmount).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @media print {
                    @page { margin: 0; }
                    body { background: white !important; margin: 15mm !important; }
                    body > * { display: none !important; }
                    body > main { display: block !important; }
                    main > * { display: none !important; }
                    main > #print-modal-root { display: block !important; }
                    .print-hidden, button { display: none !important; }
                    #printable-area { display: block !important; width: 100% !important; }
                }
            `}</style>
        </main>
    );
}
