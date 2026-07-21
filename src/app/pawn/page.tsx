'use client';

import { useState, useMemo, useEffect } from 'react';
import Header from '../components/Header';
import { useGoldRates } from '@/hooks/useGoldRates';
import CustomDatePicker from '../components/CustomDatePicker';
import {
    Calendar, Plus, Trash2,
    Printer, X, Percent, User, Phone,
    Shield, MapPin, Box, ChevronRight, Store
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

interface ExtraCash {
    id: string;
    amount: string;
    date: string;
}

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function PawnCalculatorContent() {
    const searchParams = useSearchParams();
    const isShopMode = searchParams.get('mode') === 'shop';

    const [principal, setPrincipal] = useState<string>('10000');
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [interestRate, setInterestRate] = useState<string>('2'); // 2% per month
    const [extraCash, setExtraCash] = useState<ExtraCash[]>([]);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const { rates, isSyncing } = useGoldRates();
    const { t } = useLanguage();

    // Pawn Shop Mode States
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAadhaar, setCustomerAadhaar] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [productType, setProductType] = useState('Earring');
    const [returnDate, setReturnDate] = useState<string>(new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]);
    const [billNumber, setBillNumber] = useState<string>('');

    // Generate Bill Number on Mount
    useEffect(() => {
        const year = new Date().getFullYear().toString().slice(-2);
        setBillNumber(`SVJ-P-${year}-${Date.now().toString().slice(-4)}`);
    }, [showPrintModal]);

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
        <main className="min-h-screen bg-white pb-32 pt-[54px] md:pt-[60px]">
            <Header rates={rates || undefined} />

            <div className="max-w-7xl w-full mx-auto px-4 md:px-5 mt-0.5 md:mt-1">
                <div className="mb-6 pt-[10px]">
                    <h1 className="text-[16px] md:text-[20px] text-gray-900 uppercase font-heading">
                        {isShopMode ? t('pawnShop') : t('pawnCalculator')}
                    </h1>
                    <p className="text-[9px] md:text-[10px] font-bold text-[#8B2332] uppercase tracking-[0.1em] mt-0.5">
                        {isShopMode ? t('manageRecordsSettlement') : t('interestSettlementCalculator')}
                    </p>
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
                                <h3 className="text-sm uppercase text-gray-800 font-heading">{t('customerDetails')}</h3>
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
                                            placeholder={t('enterName')}
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
                                            placeholder={t('digitNumber10')}
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
                                        placeholder={t('fullAddress')}
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
                                <h3 className="text-sm uppercase text-gray-800 font-heading">{t('assetDetails')}</h3>
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
                                                <option key={item} value={item}>{t(item as any)}</option>
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
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-600 uppercase tracking-widest block ml-1">{t('monthlyInterestRate')}</label>
                                    <div className="relative">
                                        <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={interestRate}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === '' || /^\d*\.?\d*$/.test(val)) setInterestRate(val);
                                            }}
                                            className="w-full pl-12 pr-4 py-4.5 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#D4AF37]/10 focus:border-[#D4AF37] outline-none transition-all font-bold text-lg text-gray-800 shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button Section */}
                        <div className="pt-8">
                            <button
                                onClick={() => setShowPrintModal(true)}
                                className="w-full bg-[#333333] hover:bg-black text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-gray-200 transition-all flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 text-sm"
                            >
                                <Store size={22} className="text-[#D4AF37]" />
                                {t('submitPawn')}
                            </button>
                        </div>

                        <div className="text-center py-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em]">{t('sriVasaviJewellery')}</p>
                        </div>
                    </div>
                ) : (
                    /* Calculator Mode View — Two Column Layout */
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 mt-2 md:mt-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-10 items-stretch">
                            {/* Left Column — Input Sections */}
                            <div className="flex flex-col gap-6">
                                {/* Title Grouping for Inputs */}
                                <div className="flex flex-col gap-6">
                                    {/* Loan Amount Card */}
                                    <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col gap-3">
                                        <label className="text-[10px] font-black text-gray-800 uppercase tracking-[0.2em]">{t('loanAmount')}</label>
                                        <div className="relative flex items-center group">
                                            <span className="absolute left-0 text-lg font-bold text-gray-400 transition-colors group-focus-within:text-[#8B2332]">₹</span>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={principal}
                                                onFocus={() => { if (principal === '0') setPrincipal(''); }}
                                                onBlur={() => { if (principal === '') setPrincipal('0'); }}
                                                onChange={(e) => setPrincipal(e.target.value.replace(/\D/g, ''))}
                                                className="w-full pl-6 py-2 bg-transparent border-b border-gray-100 focus:border-[#8B2332] outline-none transition-all font-bold text-xl text-gray-800"
                                            />
                                        </div>
                                    </div>

                                    {/* Interest Rate Card */}
                                    <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col gap-3">
                                        <label className="text-[10px] font-black text-gray-800 uppercase tracking-[0.2em]">{t('monthlyInterestRate')}</label>
                                        <div className="relative flex items-center group">
                                            <Percent size={16} className="absolute left-0 text-gray-400 transition-colors group-focus-within:text-[#8B2332]" />
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={interestRate}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === '' || /^\d*\.?\d*$/.test(val)) setInterestRate(val);
                                                }}
                                                className="w-full pl-8 py-2 bg-transparent border-b border-gray-100 focus:border-[#8B2332] outline-none transition-all font-bold text-xl text-gray-800"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Loan Date Card (Spans full width of left col but now only half of page) */}
                                <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col gap-3">
                                    <label className="text-[10px] font-black text-gray-800 uppercase tracking-[0.2em]">{t('loanDate')}</label>
                                    <div className="relative w-full">
                                        <CustomDatePicker
                                            variant="underline"
                                            selected={new Date(startDate)}
                                            onChange={(date) => {
                                                if (date) {
                                                    const dateString = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
                                                    setStartDate(dateString);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                {/* Extra Cash Section Moved Here */}
                                <div className="mt-4 border-t border-gray-100 pt-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-2xl bg-[#A67C00]/10 flex items-center justify-center text-[#A67C00] shrink-0 font-black text-lg">
                                            ₹
                                        </div>
                                        <div>
                                            <h3 className="text-base text-gray-800 uppercase font-heading">{t('additionalLoans')}</h3>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t('addEntry')}</p>
                                        </div>
                                        <button
                                            onClick={addExtraCash}
                                            className="ml-auto flex items-center justify-center gap-2 bg-[#111827] text-white px-5 py-2.5 rounded-xl hover:bg-black active:scale-[0.98] transition-all duration-200 text-[10px] font-black uppercase tracking-widest"
                                        >
                                            <Plus size={14} />
                                            <span className="hidden sm:inline">{t('addEntry')}</span>
                                        </button>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        {extraCash.map((cash) => (
                                            <div key={cash.id} className="bg-white p-5 rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-gray-50 relative group animate-in fade-in slide-in-from-bottom-4 duration-300">
                                                <div className="flex flex-col gap-5">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="flex flex-col gap-2">
                                                            <label className="block text-[9px] font-black text-gray-800 uppercase tracking-[0.2em]">{t('loanAmount')}</label>
                                                            <div className="relative flex items-center group/icon">
                                                                <span className="absolute left-0 text-sm font-bold text-gray-400 transition-colors group-hover/icon:text-[#8B2332] group-focus-within/icon:text-[#8B2332]">₹</span>
                                                                <input
                                                                    type="text"
                                                                    inputMode="decimal"
                                                                    value={cash.amount}
                                                                    onFocus={() => { if (cash.amount === '0') updateExtraCash(cash.id, 'amount', ''); }}
                                                                    onBlur={() => { if (cash.amount === '') updateExtraCash(cash.id, 'amount', '0'); }}
                                                                    onChange={(e) => updateExtraCash(cash.id, 'amount', e.target.value.replace(/\D/g, ''))}
                                                                    className="w-full pl-5 py-1.5 bg-transparent border-b border-gray-100 hover:border-gray-200 focus:border-[#8B2332] outline-none transition-all duration-200 font-bold text-lg text-gray-800 leading-none"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <label className="block text-[9px] font-black text-gray-800 uppercase tracking-[0.2em]">{t('loanDate')}</label>
                                                            <div className="relative w-full">
                                                                <CustomDatePicker
                                                                    variant="underline"
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
                                                    </div>
                                                    <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar size={12} className="text-gray-400" />
                                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                                                {t('durationMonths', { months: calculations.extraBreakdown.find(b => b.id === cash.id)?.months.toFixed(2) || '0.00' })}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('interest')}:</span>
                                                                <span className="text-sm font-black text-[#8B2332]">
                                                                    ₹{Math.round(calculations.extraBreakdown.find(b => b.id === cash.id)?.interest || 0).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <button
                                                                onClick={() => removeExtraCash(cash.id)}
                                                                className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column — Summary & Results (The longer card) */}
                            <div className="bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-50 overflow-hidden flex flex-col">
                                <div className="pt-8 px-8 pb-6 border-b border-gray-50 flex items-center justify-between">
                                    <span className="text-[10px] font-black text-gray-800 uppercase tracking-[0.2em]">{t('totalPayable')}</span>
                                    <div className="flex items-baseline gap-1 text-[#8B2332]">
                                        <span className="text-xl font-bold opacity-80">₹</span>
                                        <span className="text-4xl font-black tracking-tighter">
                                            {Math.round(calculations.totalAmount).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-8 pt-6 flex-1 flex flex-col gap-6">
                                    <div className="flex flex-col gap-4 border-b border-gray-50 pb-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-gray-800 uppercase tracking-[0.2em]">{t('totalPrincipal')}</span>
                                            <span className="text-lg font-bold text-gray-800">₹{calculations.totalPrincipal.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black text-gray-800 uppercase tracking-[0.2em]">{t('totalInterest')}</span>
                                            <span className="text-lg font-bold text-gray-800">₹{Math.round(calculations.interestAmount).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Table Breakdown */}
                                    <div className="border border-[#D4AF37]/20 rounded-2xl overflow-hidden">
                                        <table className="w-full text-left border-collapse bg-white table-fixed">
                                            <thead>
                                                <tr className="border-b border-gray-50 bg-gray-50/30">
                                                    <th className="w-1/4 py-4 px-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('principal')}</th>
                                                    <th className="w-1/4 py-4 px-2 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">{t('rate')}</th>
                                                    <th className="w-1/4 py-4 px-2 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">{t('duration')}</th>
                                                    <th className="w-1/4 py-4 px-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">{t('interest')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {calculations.allEntries.map((entry, idx) => (
                                                    <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                                                        <td className="py-5 px-4 text-sm font-black text-gray-900 tracking-tight truncate">
                                                            ₹{entry.amount.toLocaleString()}
                                                        </td>
                                                        <td className="py-5 px-2 text-sm font-bold text-gray-500 text-center">
                                                            {entry.rate}%
                                                        </td>
                                                        <td className="py-5 px-2 text-sm font-bold text-gray-500 text-center">
                                                            {entry.months.toFixed(2)}m
                                                        </td>
                                                        <td className="py-5 px-4 text-sm font-black text-[#A67C00] text-right">
                                                            ₹{Math.round(entry.interest).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mt-auto pt-4">
                                        <button
                                            onClick={() => setShowPrintModal(true)}
                                            className="w-full bg-black text-white py-4 rounded-2xl hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-4 font-black uppercase tracking-[0.25em] text-xs shadow-xl shadow-gray-200"
                                        >
                                            <Printer size={18} className="text-white" />
                                            {t('printBill')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}



                <p className="mt-12 text-center text-[10px] text-gray-300 font-black uppercase tracking-[0.4em] print:hidden">
                    {t('sriVasaviJewellery')}
                </p>
            </div>

            {/* Print Modal */}
            {
                showPrintModal && (
                    <div id="print-modal-root" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:static print:bg-white print:p-0">
                        <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] print:shadow-none print:max-h-none print:rounded-none">
                            {/* Modal Header - Hidden during print */}
                            <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[#D4AF37]/10 rounded-xl text-[#D4AF37]">
                                        <Printer size={20} />
                                    </div>
                                    <h3 className="text-sm md:text-lg text-gray-800 uppercase font-heading">{t('receiptPreview')}</h3>
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                    <button
                                        onClick={handlePrint}
                                        className="flex-1 md:flex-none bg-[#D4AF37] text-white px-4 md:px-6 py-3 md:py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#B8860B] transition-all shadow-lg shadow-amber-200"
                                    >
                                        <Printer size={14} />
                                        <span className="hidden sm:inline">{t('print')}</span>
                                        <span className="sm:hidden">{t('print')}</span>
                                    </button>
                                    <button
                                        onClick={() => setShowPrintModal(false)}
                                        className="p-3 md:p-2.5 text-gray-400 hover:bg-gray-200 rounded-xl transition-all bg-white md:bg-transparent"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Printable Area */}
                            <div className="px-8 py-10 md:px-16 md:py-12 overflow-y-auto print:overflow-visible print:p-0" id="printable-area">
                                <div id="receipt-content" className="max-w-2xl mx-auto bg-white print:max-w-none">
                                    {/* Receipt Header */}
                                    {/* Receipt Header */}
                                    <div className="pb-6 border-b-4 border-[#D4AF37] mb-8">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="flex-shrink-0">
                                                <img src="/svj-1.png" alt="SVJ Logo" className="h-16 w-16 md:h-20 md:w-20 object-contain rounded-xl" />
                                            </div>
                                            <div className="flex-1 text-center">
                                                <h1 className="text-xl md:text-3xl font-serif-gold text-[#D4AF37] leading-none tracking-tight">Sri Vasavi Jewellery</h1>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-500">
                                            <p>{t('billNo')}: <span className="text-gray-900 ml-1">{billNumber}</span></p>
                                            <p>{t('date')}: <span className="text-gray-900 ml-1">{new Date().toLocaleDateString(t('all') === 'அனைத்தும்' ? 'ta-IN' : 'en-GB')}</span></p>
                                        </div>
                                    </div>

                                    {/* Customer & Asset Details */}
                                    {isShopMode && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10 pb-10 border-b border-dashed border-gray-200">
                                            <div className="space-y-4">
                                                <h4 className="text-[11px] text-[#D4AF37] uppercase border-b border-[#D4AF37]/20 pb-2 font-heading">{t('customerDetails')}</h4>
                                                <div className="space-y-2.5">
                                                    <div className="flex justify-between text-xs"><span className="text-gray-400 font-bold uppercase tracking-widest">{t('fullName')}:</span> <span className="text-gray-800 font-black uppercase">{customerName || 'N/A'}</span></div>
                                                    <div className="flex justify-between text-xs"><span className="text-gray-400 font-bold uppercase tracking-widest">{t('phoneNumber')}:</span> <span className="text-gray-800 font-black">{customerPhone || 'N/A'}</span></div>
                                                    <div className="flex justify-between text-xs"><span className="text-gray-400 font-bold uppercase tracking-widest">{t('aadhaarNumber')}:</span> <span className="text-gray-800 font-black">{customerAadhaar || 'N/A'}</span></div>
                                                    <div className="flex flex-col gap-1 mt-2">
                                                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{t('address')}:</span>
                                                        <span className="text-gray-800 font-bold text-xs uppercase leading-relaxed">{customerAddress || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="text-[11px] text-[#D4AF37] uppercase border-b border-[#D4AF37]/20 pb-2 font-heading">{t('assetDetails')}</h4>
                                                <div className="space-y-2.5">
                                                    <div className="flex justify-between text-xs"><span className="text-gray-400 font-bold uppercase tracking-widest">{t('product')}:</span> <span className="text-gray-800 font-black uppercase">{t(productType as any)}</span></div>
                                                    <div className="flex justify-between text-xs"><span className="text-gray-400 font-bold uppercase tracking-widest">{t('loanDate')}:</span> <span className="text-gray-800 font-black">{startDate}</span></div>
                                                    <div className="flex justify-between text-xs"><span className="text-gray-600 font-bold uppercase tracking-widest">{t('returnDateLabel')}:</span> <span className="text-red-600 font-black">{returnDate}</span></div>
                                                    <div className="flex justify-between text-xs"><span className="text-gray-400 font-bold uppercase tracking-widest">{t('rate')}:</span> <span className="text-gray-800 font-black">{interestRate}{t('perMonth')}</span></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Entry Breakdown Table */}
                                    <div className="mb-10">
                                        <h4 className="text-[11px] text-gray-800 uppercase mb-4 font-heading">{t('loanSummarySettlement')}</h4>
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="bg-gray-50 border-y border-gray-100 uppercase tracking-widest font-black text-gray-500">
                                                    <th className="py-3 px-2 text-left">{t('principal')}</th>
                                                    <th className="py-3 px-2 text-center">{t('loanDate')}</th>
                                                    <th className="py-3 px-2 text-center">{t('duration')}</th>
                                                    <th className="py-3 px-2 text-right">{t('interest')}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {calculations.allEntries.map((entry, idx) => (
                                                    <tr key={idx} className="font-bold text-gray-800">
                                                        <td className="py-4 px-2 text-left text-gray-800">₹{entry.amount.toLocaleString()}</td>
                                                        <td className="py-4 px-2 text-center text-gray-500">
                                                            {new Date(entry.date).toLocaleDateString('en-GB')}
                                                        </td>
                                                        <td className="py-4 px-2 text-center text-gray-500">{entry.months.toFixed(2)}m</td>
                                                        <td className="py-4 px-2 text-right text-[#D4AF37]">₹{Math.round(entry.interest).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="border-t-2 border-gray-100 font-black bg-gray-50/50">
                                                    <td colSpan={3} className="py-4 px-2 text-gray-800 uppercase tracking-widest text-[10px]">{t('grandTotalPayable')}</td>
                                                    <td className="py-4 px-2 text-right text-[#D4AF37] text-sm">₹{Math.round(calculations.totalAmount).toLocaleString()}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>

                                    {/* Terms & Conditions */}
                                    <div className="mb-12 space-y-3">
                                        <h4 className="text-[10px] text-gray-800 uppercase border-b border-gray-100 pb-1 font-heading">{t('termsConditions')}</h4>
                                        <ol className="text-[9px] text-gray-500 space-y-1.5 leading-relaxed font-medium">
                                            <li>1. {t('term1', { rate: interestRate })}</li>
                                            <li>2. {t('term2')}</li>
                                            <li>3. {t('term3')}</li>
                                            <li>4. {t('term4')}</li>
                                        </ol>
                                    </div>

                                    {/* Signature Section */}
                                    <div className="grid grid-cols-2 gap-20 pt-10">
                                        <div className="text-center">
                                            <div className="border-b border-gray-300 w-full mb-2 h-10"></div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('customerSignature')}</p>
                                        </div>
                                        <div className="text-center relative">
                                            <div className="border-b border-gray-300 w-full mb-2 h-10"></div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('forSriVasaviJewellery')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            <style jsx global>{`
                @media print {
                    @page { 
                        margin: 10mm;
                        size: A4;
                    }
                    
                    /* Hide everything except print area */
                    body * { 
                        visibility: hidden !important; 
                    }
                    
                    /* Show only the print modal and its contents */
                    #print-modal-root, 
                    #print-modal-root * { 
                        visibility: visible !important; 
                    }
                    
                    /* Reset modal to static positioning for print */
                    #print-modal-root {
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        right: 0 !important;
                        bottom: auto !important;
                        width: 100% !important;
                        height: auto !important;
                        display: block !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        background: white !important;
                        z-index: 100000;
                        overflow: visible !important;
                    }
                    
                    /* Hide modal wrapper, buttons, backdrop */
                    #print-modal-root > div {
                        position: static !important;
                        max-height: none !important;
                        height: auto !important;
                        overflow: visible !important;
                        border-radius: 0 !important;
                        box-shadow: none !important;
                    }
                    
                    /* Hide header with buttons */
                    .print-hidden, 
                    button, 
                    #print-modal-root > div > div:first-child {
                        display: none !important;
                    }
                    
                    /* Printable area - full width, no padding issues */
                    #printable-area { 
                        display: block !important; 
                        width: 100% !important; 
                        padding: 0 !important;
                        margin: 0 !important;
                        overflow: visible !important;
                        max-height: none !important;
                    }
                    
                    /* Receipt content - proper sizing */
                    #receipt-content {
                        width: 100% !important;
                        max-width: 100% !important;
                        padding: 5mm !important;
                        margin: 0 !important;
                        border: none !important;
                        box-sizing: border-box !important;
                    }
                    
                    /* Ensure table fits */
                    table {
                        width: 100% !important;
                        page-break-inside: avoid;
                    }
                    
                    /* Keep signature section together */
                    #receipt-content > div:last-child {
                        page-break-inside: avoid;
                    }
                }
            `}</style>
        </main >
    );
}

export default function PawnCalculatorPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#FDFCFB]" />}>
            <PawnCalculatorContent />
        </Suspense>
    );
}
