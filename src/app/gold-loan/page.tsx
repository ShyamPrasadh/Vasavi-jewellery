'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import { useGoldRates } from '@/hooks/useGoldRates';
import { useLanguage } from '@/context/LanguageContext';
import CustomDatePicker from '../components/CustomDatePicker';
import ConfirmModal from '../components/ConfirmModal';
import {
    Search, User, Phone, Shield, MapPin,
    Plus, Trash2, X, Printer,
    Wallet, Check, Eye, ChevronRight, Save, Edit2, ChevronDown
} from 'lucide-react';

interface AdditionalLoan {
    id: string;
    amount: number;
    date: string;
}

interface Loan {
    id: string;
    billNumber: string;
    customerName: string;
    customerPhone: string;
    customerAadhaar: string;
    customerAddress: string;
    loanAmount: number;
    productType: string;
    productWeight?: number; // Weight in grams
    loanDate: string;
    returnDate: string;
    interestRate: number;
    createdAt: string;
    additionalLoans: AdditionalLoan[];
}

export default function GoldLoanPage() {
    const { rates } = useGoldRates();
    const { t } = useLanguage();

    // New Loan Form State
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAadhaar, setCustomerAadhaar] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [loanAmount, setLoanAmount] = useState('10000');
    const [productType, setProductType] = useState('Earring');
    const [productWeight, setProductWeight] = useState('');
    const [loanDate, setLoanDate] = useState(new Date().toISOString().split('T')[0]);
    const [returnDate, setReturnDate] = useState(new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]);
    const [interestRate, setInterestRate] = useState('2');
    const [isSaving, setIsSaving] = useState(false);

    // Existing Loans State
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
    const [editForm, setEditForm] = useState<Partial<Loan>>({});

    // View Details Modal
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [viewingLoan, setViewingLoan] = useState<Loan | null>(null);

    // Additional Loan Entry
    const [newAddAmount, setNewAddAmount] = useState('');
    const [newAddDate, setNewAddDate] = useState(new Date().toISOString().split('T')[0]);
    const [editingAddId, setEditingAddId] = useState<string | null>(null);
    const [editAddForm, setEditAddForm] = useState<{ amount: string, date: string }>({ amount: '', date: '' });

    // Print Modal State
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [printLoan, setPrintLoan] = useState<Loan | null>(null);
    const [printType, setPrintType] = useState<'instant' | 'settlement'>('instant');

    // Delete Confirmation Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'loan' | 'additional'; loanId: string; additionalId?: string } | null>(null);

    // New Loan Form Visibility
    const [showNewLoanForm, setShowNewLoanForm] = useState(false);

    useEffect(() => {
        fetchLoans();
    }, []);

    useEffect(() => {
        if (showPrintModal || showEditModal || showDetailsModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [showPrintModal, showEditModal, showDetailsModal]);

    const fetchLoans = async () => {
        try {
            const res = await fetch('/api/loans');
            const data = await res.json();
            if (Array.isArray(data)) {
                setLoans(data);
            }
        } catch (err) {
            console.error('Failed to fetch loans:', err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setCustomerName('');
        setCustomerPhone('');
        setCustomerAadhaar('');
        setCustomerAddress('');
        setLoanAmount('10000');
        setProductType('Earring');
        setProductWeight('');
        setLoanDate(new Date().toISOString().split('T')[0]);
        setReturnDate(new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0]);
        setInterestRate('2');
        setShowNewLoanForm(false);
    };

    const handleAddLoan = async () => {
        const phoneDigits = customerPhone.replace(/\D/g, '');
        const aadhaarDigits = customerAadhaar.replace(/\D/g, '');

        if (!customerName || !customerPhone || !customerAadhaar || !customerAddress || !loanAmount || !productWeight || !interestRate) {
            alert('Please fill in all mandatory fields');
            return;
        }

        if (phoneDigits.length !== 10) {
            alert('Phone number must be exactly 10 digits');
            return;
        }

        if (aadhaarDigits.length !== 12) {
            alert('Aadhaar number must be exactly 12 digits');
            return;
        }

        setIsSaving(true);
        try {
            const year = new Date().getFullYear().toString().slice(-2);
            const billNum = `SVJ-P-${year}-${Date.now().toString().slice(-4)}`;

            const response = await fetch('/api/loans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    billNumber: billNum,
                    customerName,
                    customerPhone,
                    customerAadhaar,
                    customerAddress,
                    loanAmount,
                    productType,
                    productWeight: productWeight ? parseFloat(productWeight) : null,
                    loanDate,
                    returnDate,
                    interestRate
                })
            });

            if (response.ok) {
                const newLoan = await response.json();
                setPrintLoan(newLoan);
                setPrintType('instant');
                setShowPrintModal(true);
                fetchLoans();
                resetForm();
            } else {
                const data = await response.json();
                throw new Error(data.error || 'Failed to save loan');
            }
        } catch (error) {
            console.error('Error saving loan:', error);
            const message = error instanceof Error ? error.message : 'Something went wrong';
            alert(`Error: ${message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteLoan = (id: string) => {
        setDeleteTarget({ type: 'loan', loanId: id });
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            if (deleteTarget.type === 'loan') {
                await fetch(`/api/loans/${deleteTarget.loanId}`, { method: 'DELETE' });
                setLoans(loans.filter(l => l.id !== deleteTarget.loanId));
                if (viewingLoan?.id === deleteTarget.loanId) {
                    setShowDetailsModal(false);
                    setViewingLoan(null);
                }
            } else if (deleteTarget.type === 'additional' && deleteTarget.additionalId) {
                await fetch(`/api/loans/${deleteTarget.loanId}/additional?additionalId=${deleteTarget.additionalId}`, { method: 'DELETE' });
                fetchLoans();
                // Refresh viewing loan
                const updated = await fetch(`/api/loans`).then(r => r.json());
                const refreshed = updated.find((l: Loan) => l.id === deleteTarget.loanId);
                if (refreshed) setViewingLoan(refreshed);
            }
        } catch (err) {
            console.error('Failed to delete:', err);
        }
        setDeleteTarget(null);
    };

    const openEditModal = (loan: Loan) => {
        setEditingLoan(loan);
        setEditForm({
            customerName: loan.customerName,
            customerPhone: loan.customerPhone,
            customerAadhaar: loan.customerAadhaar,
            customerAddress: loan.customerAddress,
            loanAmount: loan.loanAmount,
            productType: loan.productType,
            loanDate: loan.loanDate.split('T')[0],
            returnDate: loan.returnDate?.split('T')[0] || '',
            interestRate: loan.interestRate
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editingLoan || !editForm) return;

        const phoneDigits = (editForm.customerPhone || '').replace(/\D/g, '');
        const aadhaarDigits = (editForm.customerAadhaar || '').replace(/\D/g, '');

        if (phoneDigits.length !== 10) {
            alert('Phone number must be exactly 10 digits');
            return;
        }

        if (aadhaarDigits.length !== 12) {
            alert('Aadhaar number must be exactly 12 digits');
            return;
        }

        try {
            const res = await fetch(`/api/loans/${editingLoan.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                fetchLoans();
                setShowEditModal(false);
                setEditingLoan(null);
            }
        } catch (err) {
            console.error('Failed to update loan:', err);
        }
    };

    const handleAddAdditional = async () => {
        if (!viewingLoan || !newAddAmount || parseFloat(newAddAmount) <= 0) return;
        try {
            const res = await fetch(`/api/loans/${viewingLoan.id}/additional`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: newAddAmount, date: newAddDate })
            });
            if (res.ok) {
                fetchLoans();
                setNewAddAmount('');
                setNewAddDate(new Date().toISOString().split('T')[0]);
                // Refresh viewing loan
                const updated = await fetch(`/api/loans`).then(r => r.json());
                const refreshed = updated.find((l: Loan) => l.id === viewingLoan.id);
                if (refreshed) setViewingLoan(refreshed);
            }
        } catch (err) {
            console.error('Failed to add additional loan:', err);
        }
    };

    const handleUpdateAdditional = async (additionalId: string) => {
        if (!viewingLoan || !editAddForm.amount || parseFloat(editAddForm.amount) <= 0) return;
        try {
            const res = await fetch(`/api/loans/${viewingLoan.id}/additional`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    additionalId,
                    amount: editAddForm.amount,
                    date: editAddForm.date
                })
            });
            if (res.ok) {
                fetchLoans();
                setEditingAddId(null);
                // Refresh viewing loan
                const updated = await fetch(`/api/loans`).then(r => r.json());
                const refreshed = updated.find((l: Loan) => l.id === viewingLoan.id);
                if (refreshed) setViewingLoan(refreshed);
            }
        } catch (err) {
            console.error('Failed to update additional loan:', err);
        }
    };

    const handleDeleteAdditional = (loanId: string, additionalId: string) => {
        setDeleteTarget({ type: 'additional', loanId, additionalId });
        setShowDeleteModal(true);
    };

    const calculateSummary = (loan: Loan) => {
        const baseP = loan.loanAmount;
        const r = loan.interestRate;
        const today = new Date();
        const start = new Date(loan.loanDate);
        const diffTime = Math.abs(today.getTime() - start.getTime());
        const baseMonths = diffTime / (1000 * 60 * 60 * 24 * 30.44);
        const baseInterest = baseP * (r / 100) * baseMonths;

        let additionalInterest = 0;
        loan.additionalLoans?.forEach(add => {
            const addDate = new Date(add.date);
            const addDiff = Math.abs(today.getTime() - addDate.getTime());
            const addMonths = addDiff / (1000 * 60 * 60 * 24 * 30.44);
            additionalInterest += add.amount * (r / 100) * addMonths;
        });

        const totalPrincipal = baseP + (loan.additionalLoans?.reduce((acc, a) => acc + a.amount, 0) || 0);
        const totalInterest = baseInterest + additionalInterest;

        return {
            totalPrincipal,
            totalInterest: Math.round(totalInterest),
            totalPayable: Math.round(totalPrincipal + totalInterest),
            baseMonths: baseMonths.toFixed(1)
        };
    };

    const handlePrintInstant = (loan: Loan) => {
        setPrintLoan(loan);
        setPrintType('instant');
        setShowPrintModal(true);
    };

    const handlePrintSettlement = (loan: Loan) => {
        setPrintLoan(loan);
        setPrintType('settlement');
        setShowPrintModal(true);
    };

    const openDetails = (loan: Loan) => {
        setViewingLoan(loan);
        setShowDetailsModal(true);
    };

    const filteredLoans = loans.filter(loan =>
        loan.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.customerPhone?.includes(searchQuery)
    );

    const productTypes = ['Earring', 'Necklace', 'Chain', 'Bangle', 'Ring', 'Bracelet', 'Pendant', 'Other'];

    return (
        <main className="min-h-screen bg-[#FDFCFB] pb-32 pt-[70px] md:pt-[80px]">
            <Header rates={rates || undefined} />

            <div className="max-w-7xl mx-auto px-4 md:px-6 mt-6 md:mt-8">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-black text-gray-800 uppercase tracking-tight">
                        Gold Loan
                    </h1>
                    <p className="text-[10px] md:text-xs font-bold text-[#D4AF37] uppercase tracking-[0.2em] mt-1">
                        Manage Loans & Records
                    </p>
                </div>

                {/* Search Bar + New Loan Button */}
                <div className="flex gap-2 md:gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search..."
                            className="w-full pl-9 pr-3 py-3 md:py-4 bg-white border border-gray-200 rounded-xl md:rounded-2xl font-bold text-sm text-gray-800 focus:ring-2 focus:ring-[#D4AF37]/20 focus:border-[#D4AF37] outline-none shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => setShowNewLoanForm(!showNewLoanForm)}
                        className={`flex items-center justify-center gap-1 md:gap-2 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black uppercase text-xs tracking-wider transition-all shadow-md ${showNewLoanForm ? 'bg-gray-600 text-white' : 'bg-[#D4AF37] text-white'}`}
                    >
                        {showNewLoanForm ? <X size={16} /> : <Plus size={16} />}
                        <span className="hidden sm:inline">{showNewLoanForm ? 'Cancel' : 'New'}</span>
                    </button>
                </div>

                {/* New Loan Form */}
                {showNewLoanForm && (
                    <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="bg-[#333333] text-white px-4 md:px-6 py-3 md:py-4 flex items-center gap-2">
                            <Plus size={18} className="text-[#D4AF37]" />
                            <h2 className="text-xs md:text-sm font-black uppercase tracking-widest">New Loan</h2>
                        </div>

                        <div className="p-4 md:p-8 space-y-8">
                            {/* Row 1: Customer Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2 leading-none">Customer Name *</label>
                                    <input
                                        type="text"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                                        placeholder="Enter name"
                                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-gray-800 focus:bg-white focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 outline-none transition-all placeholder:text-gray-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2 leading-none">Phone Number *</label>
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        placeholder="10 digit number"
                                        maxLength={10}
                                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-gray-800 focus:bg-white focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 outline-none transition-all placeholder:text-gray-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2 leading-none">Aadhaar Number *</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={customerAadhaar}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                                            const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                                            setCustomerAadhaar(formatted);
                                        }}
                                        placeholder="0000 0000 0000"
                                        maxLength={14}
                                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-gray-800 focus:bg-white focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 outline-none transition-all placeholder:text-gray-300"
                                    />
                                </div>
                            </div>

                            {/* Row 2: Address */}
                            <div>
                                <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1.5 leading-none">Address *</label>
                                <textarea
                                    value={customerAddress}
                                    onChange={(e) => setCustomerAddress(e.target.value)}
                                    placeholder="Full address..."
                                    rows={2}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-gray-800 focus:bg-white focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 outline-none transition-all placeholder:text-gray-300 resize-none"
                                />
                            </div>

                            {/* Row 3: Loan Details */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1.5 leading-none">Amount *</label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={loanAmount}
                                            onChange={(e) => setLoanAmount(e.target.value.replace(/\D/g, ''))}
                                            className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-gray-800 focus:bg-white focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1.5 leading-none">Product *</label>
                                    <div className="relative">
                                        <select
                                            value={productType}
                                            onChange={(e) => setProductType(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-gray-800 focus:bg-white focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            {productTypes.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <ChevronDown size={16} />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1.5 leading-none">Weight (g) *</label>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={productWeight}
                                        onChange={(e) => setProductWeight(e.target.value.replace(/[^\d.]/g, ''))}
                                        placeholder="0.00"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-gray-800 focus:bg-white focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 outline-none transition-all placeholder:text-gray-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1.5 leading-none">Rate % *</label>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={interestRate}
                                        onChange={(e) => setInterestRate(e.target.value.replace(/[^\d.]/g, ''))}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base font-bold text-gray-800 focus:bg-white focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Row 4: Dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-2">
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1.5 leading-none">Loan Date *</label>
                                    <CustomDatePicker
                                        selected={loanDate ? new Date(loanDate) : null}
                                        onChange={(date) => date && setLoanDate(date.toISOString().split('T')[0])}
                                        maxDate={new Date()}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1.5 leading-none">Est. Return *</label>
                                    <CustomDatePicker
                                        selected={returnDate ? new Date(returnDate) : null}
                                        onChange={(date) => date && setReturnDate(date.toISOString().split('T')[0])}
                                        minDate={loanDate ? new Date(loanDate) : undefined}
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                onClick={handleAddLoan}
                                disabled={isSaving}
                                className={`w-full ${isSaving ? 'bg-gray-400' : 'bg-[#D4AF37] hover:bg-[#B8860B]'} text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-200/30`}
                            >
                                <Printer size={18} />
                                {isSaving ? 'Saving...' : 'Save & Print'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Section Header */}
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                    Recent Gold Loans
                </h3>

                {/* Loan Cards - Mobile Friendly */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
                        </div>
                    ) : filteredLoans.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No loans found</p>
                        </div>
                    ) : (
                        filteredLoans.map((loan) => {
                            const summary = calculateSummary(loan);
                            return (
                                <div
                                    key={loan.id}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer group"
                                    onClick={() => openDetails(loan)}
                                >
                                    <div className="p-4 md:p-5 flex items-center gap-4">
                                        {/* Left: Bill & Name */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="bg-amber-50 text-[#B8860B] px-2 py-0.5 rounded-md text-[10px] font-black tracking-wider border border-amber-100/50">
                                                    {loan.billNumber}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                    {new Date(loan.loanDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                </span>
                                            </div>
                                            <p className="font-black text-gray-800 uppercase text-lg md:text-xl tracking-tight truncate group-hover:text-[#D4AF37] transition-colors leading-tight">{loan.customerName}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{loan.customerPhone || 'No phone'}</p>
                                        </div>

                                        {/* Right: Amount & Arrow */}
                                        <div className="text-right shrink-0">
                                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Payable</p>
                                            <p className="text-xl md:text-2xl font-black text-[#D4AF37] tracking-tighter">₹{summary.totalPayable.toLocaleString()}</p>
                                        </div>
                                        <ChevronRight size={20} className="text-gray-300 group-hover:text-[#D4AF37] transition-all shrink-0" />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <p className="mt-10 text-center text-[9px] text-gray-300 font-black uppercase tracking-[0.3em]">
                    Sri Vasavi Jewellery
                </p>
            </div>

            {/* View Details Modal - Full Screen Practical View */}
            {showDetailsModal && viewingLoan && (() => {
                const summary = calculateSummary(viewingLoan);
                const daysActive = Math.floor((new Date().getTime() - new Date(viewingLoan.loanDate).getTime()) / (1000 * 60 * 60 * 24));
                const isOverdue = viewingLoan.returnDate && new Date(viewingLoan.returnDate) < new Date();

                return (
                    <div className="fixed inset-0 z-[100] bg-[#FDFCFB] overflow-hidden flex flex-col">
                        {/* Full Header */}
                        <div className="bg-[#333333] text-white px-4 md:px-8 py-4 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <button onClick={() => { setShowDetailsModal(false); setEditForm({}); }} className="p-2 hover:bg-white/10 rounded-xl">
                                    <X size={24} />
                                </button>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold">{viewingLoan.billNumber}</p>
                                    {editForm.id === viewingLoan.id ? (
                                        <input
                                            type="text"
                                            value={editForm.customerName || ''}
                                            onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                                            className="text-xl font-black uppercase bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white w-48"
                                        />
                                    ) : (
                                        <h3 className="text-xl font-black uppercase">{viewingLoan.customerName}</h3>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {editForm.id === viewingLoan.id ? (
                                    <>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const res = await fetch(`/api/loans/${viewingLoan.id}`, {
                                                        method: 'PUT',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify(editForm)
                                                    });
                                                    if (res.ok) {
                                                        const updated = await res.json();
                                                        setLoans(loans.map(l => l.id === updated.id ? updated : l));
                                                        setViewingLoan(updated);
                                                        setEditForm({});
                                                    }
                                                } catch (err) {
                                                    console.error('Failed to save:', err);
                                                }
                                            }}
                                            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-xl font-black text-xs uppercase flex items-center gap-2"
                                        >
                                            <Save size={16} /> Save
                                        </button>
                                        <button onClick={() => setEditForm({})} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-black text-xs uppercase">
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => handlePrintInstant(viewingLoan)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-black text-xs uppercase flex items-center gap-2">
                                        <Printer size={16} /> Print
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="max-w-4xl mx-auto p-4 md:p-8">
                                {/* Large Summary Cards */}
                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Principal</p>
                                        <p className="text-3xl md:text-4xl font-black text-gray-800">₹{summary.totalPrincipal.toLocaleString()}</p>
                                        <p className="text-xs text-gray-400 mt-2">Base: ₹{viewingLoan.loanAmount.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl text-center border border-orange-200">
                                        <p className="text-xs font-black text-orange-600 uppercase tracking-widest mb-2">Interest Due</p>
                                        <p className="text-3xl md:text-4xl font-black text-orange-600">₹{summary.totalInterest.toLocaleString()}</p>
                                        <p className="text-xs text-orange-400 mt-2">@ {viewingLoan.interestRate}% per month</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/30 p-6 rounded-2xl text-center border border-[#D4AF37]/40">
                                        <p className="text-xs font-black text-[#B8860B] uppercase tracking-widest mb-2">Total Payable</p>
                                        <p className="text-3xl md:text-4xl font-black text-[#B8860B]">₹{summary.totalPayable.toLocaleString()}</p>
                                        <p className="text-xs text-[#B8860B]/70 mt-2">{daysActive} days active</p>
                                    </div>
                                </div>

                                {/* Two Column Layout */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    {/* Customer Details Card */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                                            <h4 className="text-xs font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
                                                <User size={16} className="text-[#D4AF37]" />
                                                Customer Details
                                            </h4>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                                <span className="text-sm text-gray-500">Name</span>
                                                {editForm.id === viewingLoan.id ? (
                                                    <input type="text" value={editForm.customerName || ''} onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })} className="text-sm font-black text-gray-800 uppercase bg-gray-50 border rounded-lg px-2 py-1 text-right w-32" />
                                                ) : (
                                                    <span className="text-sm font-black text-gray-800 uppercase">{viewingLoan.customerName}</span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                                <span className="text-sm text-gray-500">Phone</span>
                                                {editForm.id === viewingLoan.id ? (
                                                    <input
                                                        type="tel"
                                                        inputMode="numeric"
                                                        maxLength={10}
                                                        value={editForm.customerPhone || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                                        className="text-sm font-bold text-gray-800 bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-right w-36 focus:border-[#D4AF37] outline-none"
                                                        placeholder="10 digits"
                                                    />
                                                ) : (
                                                    <span className="text-sm font-bold text-gray-800">{viewingLoan.customerPhone || 'Not provided'}</span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                                <span className="text-sm text-gray-500">Aadhaar</span>
                                                {editForm.id === viewingLoan.id ? (
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        maxLength={14}
                                                        value={editForm.customerAadhaar || ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                                                            const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                                                            setEditForm({ ...editForm, customerAadhaar: formatted });
                                                        }}
                                                        className="text-sm font-bold text-gray-800 bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-right w-40 focus:border-[#D4AF37] outline-none"
                                                        placeholder="0000 0000 0000"
                                                    />
                                                ) : (
                                                    <span className="text-sm font-bold text-gray-800">{viewingLoan.customerAadhaar || 'Not provided'}</span>
                                                )}
                                            </div>
                                            <div className="py-2">
                                                <span className="text-sm text-gray-500 block mb-1">Address</span>
                                                {editForm.id === viewingLoan.id ? (
                                                    <textarea value={editForm.customerAddress || ''} onChange={(e) => setEditForm({ ...editForm, customerAddress: e.target.value })} rows={2} className="text-sm font-bold text-gray-800 bg-white border-2 border-gray-200 rounded-lg px-3 py-2 w-full resize-none focus:border-[#D4AF37] outline-none" />
                                                ) : (
                                                    <span className="text-sm font-bold text-gray-800">{viewingLoan.customerAddress || 'Not provided'}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Loan Details Card */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                                            <h4 className="text-xs font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
                                                <Wallet size={16} className="text-[#D4AF37]" />
                                                Loan Details
                                            </h4>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                                <span className="text-sm text-gray-500">Product</span>
                                                {editForm.id === viewingLoan.id ? (
                                                    <select value={editForm.productType || ''} onChange={(e) => setEditForm({ ...editForm, productType: e.target.value })} className="text-sm font-black text-gray-800 bg-gray-50 border rounded-lg px-2 py-1">
                                                        <option value="Earring">Earring</option>
                                                        <option value="Necklace">Necklace</option>
                                                        <option value="Chain">Chain</option>
                                                        <option value="Bangle">Bangle</option>
                                                        <option value="Ring">Ring</option>
                                                        <option value="Bracelet">Bracelet</option>
                                                        <option value="Pendant">Pendant</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                ) : (
                                                    <span className="text-sm font-black text-gray-800">{viewingLoan.productType}</span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                                <span className="text-sm text-gray-500">Weight (g)</span>
                                                {editForm.id === viewingLoan.id ? (
                                                    <input
                                                        type="text"
                                                        inputMode="decimal"
                                                        value={editForm.productWeight || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, productWeight: parseFloat(e.target.value.replace(/[^\d.]/g, '')) || 0 })}
                                                        className="text-sm font-bold text-gray-800 bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-right w-28 focus:border-[#D4AF37] outline-none"
                                                        placeholder="Grams"
                                                    />
                                                ) : (
                                                    <span className="text-sm font-bold text-gray-800">{viewingLoan.productWeight ? `${viewingLoan.productWeight}g` : 'N/A'}</span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                                <span className="text-sm text-gray-500">Principal</span>
                                                {editForm.id === viewingLoan.id ? (
                                                    <input type="text" inputMode="numeric" value={editForm.loanAmount || ''} onChange={(e) => setEditForm({ ...editForm, loanAmount: parseInt(e.target.value.replace(/\D/g, '')) || 0 })} className="text-sm font-bold text-gray-800 bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-right w-28 focus:border-[#D4AF37] outline-none" />
                                                ) : (
                                                    <span className="text-sm font-bold text-gray-800">₹{viewingLoan.loanAmount.toLocaleString()}</span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                                <span className="text-sm text-gray-500">Interest Rate</span>
                                                {editForm.id === viewingLoan.id ? (
                                                    <div className="flex items-center gap-1">
                                                        <input type="text" inputMode="decimal" value={editForm.interestRate || ''} onChange={(e) => setEditForm({ ...editForm, interestRate: parseFloat(e.target.value.replace(/[^\d.]/g, '')) || 0 })} className="text-sm font-bold text-gray-800 bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-right w-16 focus:border-[#D4AF37] outline-none" />
                                                        <span className="text-xs text-gray-400 font-bold">%/m</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm font-bold text-gray-800">{viewingLoan.interestRate}%/m</span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-50 relative z-[200]">
                                                <span className="text-sm text-gray-500">Loan Date</span>
                                                {editForm.id === viewingLoan.id ? (
                                                    <div className="relative z-[200]">
                                                        <CustomDatePicker
                                                            selected={editForm.loanDate ? new Date(editForm.loanDate) : new Date(viewingLoan.loanDate)}
                                                            onChange={(date) => setEditForm({ ...editForm, loanDate: date.toISOString().split('T')[0] })}
                                                            align="right"
                                                            maxDate={new Date()}
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className="text-sm font-bold text-gray-800">{new Date(viewingLoan.loanDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center py-2 relative z-[150]">
                                                <span className="text-sm text-gray-500">Expected Return</span>
                                                {editForm.id === viewingLoan.id ? (
                                                    <div className="relative z-[150]">
                                                        <CustomDatePicker
                                                            selected={editForm.returnDate ? new Date(editForm.returnDate) : (viewingLoan.returnDate ? new Date(viewingLoan.returnDate) : new Date())}
                                                            onChange={(date) => setEditForm({ ...editForm, returnDate: date.toISOString().split('T')[0] })}
                                                            align="right"
                                                            minDate={editForm.loanDate ? new Date(editForm.loanDate) : new Date(viewingLoan.loanDate)}
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className={`text-sm font-bold ${isOverdue ? 'text-red-500' : 'text-gray-800'}`}>
                                                        {viewingLoan.returnDate ? new Date(viewingLoan.returnDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not set'}
                                                        {isOverdue && ' (OVERDUE)'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-sm text-gray-500">Duration</span>
                                                <span className="text-sm font-black text-[#D4AF37]">{summary.baseMonths} months</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Loans Section */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible mb-8 relative z-[50]">
                                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                        <h4 className="text-xs font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
                                            <Plus size={16} className="text-[#D4AF37]" />
                                            Additional Loans ({viewingLoan.additionalLoans?.length || 0})
                                        </h4>
                                    </div>
                                    <div className="p-6 overflow-visible">
                                        {viewingLoan.additionalLoans?.length > 0 ? (
                                            <div className="space-y-3 mb-6">
                                                {viewingLoan.additionalLoans.map((add, idx) => {
                                                    const addDate = new Date(add.date);
                                                    const addMonths = Math.abs(new Date().getTime() - addDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
                                                    const addInterest = add.amount * (viewingLoan.interestRate / 100) * addMonths;
                                                    const isEditing = editingAddId === add.id;

                                                    return (
                                                        <div key={add.id} className={`flex items-center justify-between p-4 ${isEditing ? 'bg-amber-50 border-2 border-[#D4AF37]/30' : 'bg-gray-50'} rounded-2xl transition-all`}>
                                                            <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
                                                                <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center font-black text-[#D4AF37] shrink-0">
                                                                    {idx + 1}
                                                                </div>
                                                                {isEditing ? (
                                                                    <div className="flex flex-col md:flex-row gap-3 flex-1">
                                                                        <div className="relative flex-1">
                                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                                                            <input
                                                                                type="text"
                                                                                inputMode="numeric"
                                                                                value={editAddForm.amount}
                                                                                onChange={(e) => setEditAddForm({ ...editAddForm, amount: e.target.value.replace(/\D/g, '') })}
                                                                                className="w-full pl-7 pr-3 py-2 bg-white border border-gray-200 rounded-lg font-bold text-gray-800 outline-none focus:border-[#D4AF37]"
                                                                            />
                                                                        </div>
                                                                        <div className="relative flex-1 z-[200]">
                                                                            <CustomDatePicker
                                                                                selected={new Date(editAddForm.date)}
                                                                                onChange={(date) => date && setEditAddForm({ ...editAddForm, date: date.toISOString().split('T')[0] })}
                                                                                maxDate={new Date()}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div>
                                                                        <p className="font-black text-gray-800 text-lg">₹{add.amount.toLocaleString()}</p>
                                                                        <p className="text-xs text-gray-400 font-bold tracking-tight">{addDate.toLocaleDateString('en-GB')} • {addMonths.toFixed(1)}m</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-4 ml-4">
                                                                {isEditing ? (
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => handleUpdateAdditional(add.id)}
                                                                            className="p-3 bg-[#D4AF37] text-white rounded-xl hover:bg-[#B8860B]"
                                                                        >
                                                                            <Check size={18} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setEditingAddId(null)}
                                                                            className="p-3 bg-gray-200 text-gray-500 rounded-xl hover:bg-gray-300"
                                                                        >
                                                                            <X size={18} />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <div className="text-right hidden sm:block">
                                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Interest</p>
                                                                            <p className="font-black text-orange-500">₹{Math.round(addInterest).toLocaleString()}</p>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => {
                                                                                setEditingAddId(add.id);
                                                                                setEditAddForm({ amount: add.amount.toString(), date: add.date.split('T')[0] });
                                                                            }}
                                                                            className="p-3 text-blue-400 hover:bg-blue-50 rounded-xl transition-colors"
                                                                        >
                                                                            <Edit2 size={18} />
                                                                        </button>
                                                                        <button onClick={() => handleDeleteAdditional(viewingLoan.id, add.id)} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                                                                            <Trash2 size={18} />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-gray-400 text-sm mb-6">No additional loans added yet</p>
                                        )}

                                        {/* Add New Additional Loan */}
                                        <div className="p-5 bg-amber-50 rounded-2xl border-2 border-amber-100/50">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-6 h-6 bg-[#D4AF37] text-white rounded-full flex items-center justify-center text-[10px] font-black">
                                                    <Plus size={12} />
                                                </div>
                                                <h5 className="text-[10px] font-black text-[#B8860B] uppercase tracking-widest">Add Extra Loan</h5>
                                            </div>
                                            <div className="flex flex-col md:flex-row gap-4">
                                                <div className="flex-1">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Amount</label>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            value={newAddAmount}
                                                            onChange={(e) => setNewAddAmount(e.target.value.replace(/\D/g, ''))}
                                                            placeholder="0.00"
                                                            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-100 rounded-xl font-bold text-gray-800 focus:border-[#D4AF37] outline-none transition-all placeholder:text-gray-300"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex-1 relative z-[100]">
                                                    <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Date</label>
                                                    <div className="relative z-[100]">
                                                        <CustomDatePicker
                                                            selected={newAddDate ? new Date(newAddDate) : new Date()}
                                                            onChange={(date) => {
                                                                if (date) setNewAddDate(date.toISOString().split('T')[0]);
                                                            }}
                                                            maxDate={new Date()}
                                                            minDate={loanDate ? new Date(loanDate) : undefined}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="md:pt-6">
                                                    <button
                                                        onClick={handleAddAdditional}
                                                        className="w-full md:w-auto h-full px-8 py-3 bg-[#333] text-[#D4AF37] rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg"
                                                    >
                                                        <Plus size={14} /> Add Loan
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Fixed Bottom Action Bar */}
                        <div className="bg-white border-t border-gray-200 px-4 md:px-8 py-4 shrink-0">
                            <div className="max-w-4xl mx-auto flex gap-3">
                                {editForm.id === viewingLoan.id ? (
                                    <>
                                        <button
                                            onClick={async () => {
                                                const phoneDigits = (editForm.customerPhone || '').replace(/\D/g, '');
                                                const aadhaarDigits = (editForm.customerAadhaar || '').replace(/\D/g, '');

                                                if (phoneDigits.length !== 10) {
                                                    alert('Phone number must be exactly 10 digits');
                                                    return;
                                                }
                                                if (aadhaarDigits.length !== 12) {
                                                    alert('Aadhaar number must be exactly 12 digits');
                                                    return;
                                                }

                                                try {
                                                    const res = await fetch(`/api/loans/${viewingLoan.id}`, {
                                                        method: 'PUT',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify(editForm)
                                                    });
                                                    if (res.ok) {
                                                        const updated = await res.json();
                                                        setLoans(loans.map(l => l.id === updated.id ? updated : l));
                                                        setViewingLoan(updated);
                                                        setEditForm({});
                                                    }
                                                } catch (err) {
                                                    console.error('Failed to save:', err);
                                                }
                                            }}
                                            className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-2 hover:bg-green-600 transition-all"
                                        >
                                            <Save size={18} /> Save Changes
                                        </button>
                                        <button
                                            onClick={() => setEditForm({})}
                                            className="flex-1 py-4 bg-gray-400 text-white rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-2 hover:bg-gray-500 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setEditForm({
                                                id: viewingLoan.id,
                                                customerName: viewingLoan.customerName,
                                                customerPhone: viewingLoan.customerPhone,
                                                customerAadhaar: viewingLoan.customerAadhaar,
                                                customerAddress: viewingLoan.customerAddress,
                                                productType: viewingLoan.productType,
                                                productWeight: viewingLoan.productWeight,
                                                loanAmount: viewingLoan.loanAmount,
                                                loanDate: viewingLoan.loanDate,
                                                returnDate: viewingLoan.returnDate,
                                                interestRate: viewingLoan.interestRate
                                            })}
                                            className="flex-1 py-4 bg-blue-500 text-white rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-2 hover:bg-blue-600 transition-all"
                                        >
                                            Edit Details
                                        </button>
                                        <button
                                            onClick={() => handlePrintSettlement(viewingLoan)}
                                            className="flex-1 py-4 bg-[#D4AF37] text-white rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-2 hover:bg-[#B8860B] transition-all shadow-lg shadow-amber-200/30"
                                        >
                                            <Wallet size={18} /> Settle Now
                                        </button>
                                        <button
                                            onClick={() => handleDeleteLoan(viewingLoan.id)}
                                            className="py-4 px-6 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Edit Modal */}
            {showEditModal && editingLoan && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-lg md:rounded-3xl rounded-t-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
                        <div className="px-5 py-4 bg-[#333333] text-white flex items-center justify-between shrink-0">
                            <h3 className="text-sm font-black uppercase tracking-widest">Edit Loan</h3>
                            <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white/10 rounded-xl">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">Name</label>
                                    <input type="text" value={editForm.customerName || ''} onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })} className="w-full px-3 py-2.5 border rounded-xl font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">Phone</label>
                                    <input
                                        type="text"
                                        value={editForm.customerPhone || ''}
                                        onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                        className="w-full px-3 py-2.5 border rounded-xl font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">Aadhaar</label>
                                    <input
                                        type="text"
                                        value={editForm.customerAadhaar || ''}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                                            const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                                            setEditForm({ ...editForm, customerAadhaar: formatted });
                                        }}
                                        maxLength={14}
                                        className="w-full px-3 py-2.5 border rounded-xl font-bold"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">Address</label>
                                    <textarea value={editForm.customerAddress || ''} onChange={(e) => setEditForm({ ...editForm, customerAddress: e.target.value })} rows={2} className="w-full px-3 py-2.5 border rounded-xl font-bold resize-none" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">Principal</label>
                                    <input type="number" value={editForm.loanAmount || ''} onChange={(e) => setEditForm({ ...editForm, loanAmount: parseFloat(e.target.value) })} className="w-full px-3 py-2.5 border rounded-xl font-bold" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-gray-500 uppercase mb-1">Rate %</label>
                                    <input type="number" value={editForm.interestRate || ''} onChange={(e) => setEditForm({ ...editForm, interestRate: parseFloat(e.target.value) })} className="w-full px-3 py-2.5 border rounded-xl font-bold" />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t flex gap-2 shrink-0 bg-gray-50">
                            <button onClick={() => setShowEditModal(false)} className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-black text-xs uppercase">Cancel</button>
                            <button onClick={handleSaveEdit} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2">
                                <Check size={14} /> Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Print Modal */}
            {showPrintModal && printLoan && (() => {
                const summary = calculateSummary(printLoan);
                return (
                    <div id="print-modal-root" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:static print:bg-white print:p-0">
                        <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] print:shadow-none print:max-h-none print:rounded-none">
                            {/* Header with Print Button */}
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center print:hidden bg-gray-50">
                                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">
                                    {printType === 'instant' ? 'Loan Receipt' : 'Settlement Receipt'}
                                </h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => window.print()}
                                        className="flex-1 md:flex-none bg-[#D4AF37] text-white px-4 md:px-6 py-3 md:py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#B8860B] transition-all shadow-lg shadow-amber-200"
                                    >
                                        <Printer size={14} />
                                        Print
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
                                            <p>Bill No: <span className="text-gray-900 ml-1">{printLoan.billNumber}</span></p>
                                            <p>Date: <span className="text-gray-900 ml-1">{new Date().toLocaleDateString('en-GB')}</span></p>
                                        </div>
                                    </div>

                                    {/* Customer & Asset Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10 pb-10 border-b border-dashed border-gray-200">
                                        <div className="space-y-4">
                                            <h4 className="text-[11px] font-black text-[#D4AF37] uppercase tracking-[0.2em] border-b border-[#D4AF37]/20 pb-2">Customer Details</h4>
                                            <div className="space-y-2.5">
                                                <div className="flex justify-between text-xs"><span className="text-gray-400 font-bold uppercase tracking-widest">Name:</span> <span className="text-gray-800 font-black uppercase">{printLoan.customerName || 'N/A'}</span></div>
                                                <div className="flex justify-between text-xs"><span className="text-gray-400 font-bold uppercase tracking-widest">Phone:</span> <span className="text-gray-800 font-black">{printLoan.customerPhone || 'N/A'}</span></div>
                                                <div className="flex justify-between text-xs"><span className="text-gray-400 font-bold uppercase tracking-widest">Aadhaar:</span> <span className="text-gray-800 font-black">{printLoan.customerAadhaar || 'N/A'}</span></div>
                                                {printLoan.customerAddress && (
                                                    <div className="flex flex-col gap-1 mt-2">
                                                        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Address:</span>
                                                        <span className="text-gray-800 font-bold text-xs uppercase leading-relaxed">{printLoan.customerAddress}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-[11px] font-black text-[#D4AF37] uppercase tracking-[0.2em] border-b border-[#D4AF37]/20 pb-2">Asset Details</h4>
                                            <div className="space-y-2.5">
                                                <div className="flex justify-between text-xs"><span className="text-gray-400 font-bold uppercase tracking-widest">Product:</span> <span className="text-gray-800 font-black uppercase">{printLoan.productType}</span></div>
                                                <div className="flex justify-between text-xs"><span className="text-gray-400 font-bold uppercase tracking-widest">Loan Date:</span> <span className="text-gray-800 font-black">{new Date(printLoan.loanDate).toLocaleDateString('en-GB')}</span></div>
                                                <div className="flex justify-between text-xs"><span className="text-gray-600 font-bold uppercase tracking-widest">Return Date:</span> <span className="text-red-600 font-black">{printLoan.returnDate ? new Date(printLoan.returnDate).toLocaleDateString('en-GB') : 'N/A'}</span></div>
                                                <div className="flex justify-between text-xs"><span className="text-gray-400 font-bold uppercase tracking-widest">Rate:</span> <span className="text-gray-800 font-black">{printLoan.interestRate}% / m</span></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Entry Breakdown Table */}
                                    <div className="mb-10">
                                        <h4 className="text-[11px] font-black text-gray-800 uppercase tracking-[0.2em] mb-4">Loan Summary / Settlement</h4>
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="bg-gray-50 border-y border-gray-100 uppercase tracking-widest font-black text-gray-500">
                                                    <th className="py-3 px-2 text-left">PRINCIPAL</th>
                                                    <th className="py-3 px-2 text-center">LOAN DATE</th>
                                                    <th className="py-3 px-2 text-center">DURATION</th>
                                                    <th className="py-3 px-2 text-right">INTEREST</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {/* Base Loan Entry */}
                                                <tr className="font-bold text-gray-800">
                                                    <td className="py-4 px-2 text-left text-gray-800">₹{printLoan.loanAmount.toLocaleString()}</td>
                                                    <td className="py-4 px-2 text-center text-gray-500">{new Date(printLoan.loanDate).toLocaleDateString('en-GB')}</td>
                                                    <td className="py-4 px-2 text-center text-gray-500">{summary.baseMonths}m</td>
                                                    <td className="py-4 px-2 text-right text-[#D4AF37]">₹{Math.round(printLoan.loanAmount * (printLoan.interestRate / 100) * parseFloat(summary.baseMonths)).toLocaleString()}</td>
                                                </tr>
                                                {/* Additional Loans */}
                                                {printLoan.additionalLoans?.map((add, idx) => {
                                                    const addDate = new Date(add.date);
                                                    const today = new Date();
                                                    const addMonths = Math.abs(today.getTime() - addDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
                                                    const addInterest = add.amount * (printLoan.interestRate / 100) * addMonths;
                                                    return (
                                                        <tr key={idx} className="font-bold text-gray-800">
                                                            <td className="py-4 px-2 text-left text-gray-800">₹{add.amount.toLocaleString()}</td>
                                                            <td className="py-4 px-2 text-center text-gray-500">{addDate.toLocaleDateString('en-GB')}</td>
                                                            <td className="py-4 px-2 text-center text-gray-500">{addMonths.toFixed(2)}m</td>
                                                            <td className="py-4 px-2 text-right text-[#D4AF37]">₹{Math.round(addInterest).toLocaleString()}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Grand Total Section */}
                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-8 border border-gray-200">
                                        <div className="grid grid-cols-3 gap-4 text-center">
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Principal</p>
                                                <p className="text-xl font-black text-gray-800">₹{summary.totalPrincipal.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Interest</p>
                                                <p className="text-xl font-black text-orange-500">₹{summary.totalInterest.toLocaleString()}</p>
                                            </div>
                                            <div className="bg-[#D4AF37]/10 rounded-xl p-3 -m-3">
                                                <p className="text-[9px] font-black text-[#D4AF37] uppercase tracking-widest mb-1">Grand Total</p>
                                                <p className="text-2xl font-black text-[#D4AF37]">₹{summary.totalPayable.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="text-center pt-6 border-t border-gray-100">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Thank you for your business</p>
                                        <p className="text-[8px] mt-2 text-gray-300 uppercase tracking-widest">Sri Vasavi Jewellery</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
                onConfirm={confirmDelete}
                title={deleteTarget?.type === 'loan' ? 'Delete Loan' : 'Delete Entry'}
                message={deleteTarget?.type === 'loan'
                    ? 'Delete this loan and all associated entries? This cannot be undone.'
                    : 'Delete this additional entry? This cannot be undone.'}
            />

            <style jsx global>{`
                @media print {
                    @page { margin: 10mm; size: A4; }
                    body * { visibility: hidden !important; }
                    #print-modal-root, #print-modal-root * { visibility: visible !important; }
                    #print-modal-root { position: absolute !important; top: 0 !important; left: 0 !important; right: 0 !important; width: 100% !important; }
                    #print-modal-root > div { border-radius: 0 !important; box-shadow: none !important; }
                    .print-hidden { display: none !important; }
                }
            `}</style>
        </main>
    );
}
