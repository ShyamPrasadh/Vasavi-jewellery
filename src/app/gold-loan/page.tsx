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
    Wallet, Check, Eye, ChevronRight, Save, Edit2, ChevronDown,
    Filter, Calendar, ArrowUpDown, IndianRupee, AlertCircle, Clock, CheckCircle, Circle
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
    updatedAt?: string;
    status?: string; // active, settled
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

    // Filter State
    const [showFilterPopup, setShowFilterPopup] = useState(false);
    const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [minAmount, setMinAmount] = useState<number>(1000);
    const [maxAmount, setMaxAmount] = useState<number>(100000);
    const [amountAboveLakh, setAmountAboveLakh] = useState<boolean>(false);
    const [overdueFilter, setOverdueFilter] = useState<'all' | 'overdue' | 'active' | 'settled'>('all');
    const [productFilter, setProductFilter] = useState<string>('all');
    const [dateFrom, setDateFrom] = useState<Date | null>(null);
    const [dateTo, setDateTo] = useState<Date | null>(null);

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

    const filteredLoans = useMemo(() => {
        const today = new Date();

        let filtered = loans.filter(loan =>
            loan.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            loan.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            loan.customerPhone?.includes(searchQuery)
        );

        // Amount filter with slider
        filtered = filtered.filter(loan => {
            const totalAmount = loan.loanAmount + (loan.additionalLoans?.reduce((sum, a) => sum + a.amount, 0) || 0);
            if (amountAboveLakh) {
                return totalAmount >= 100000;
            }
            return totalAmount >= minAmount && totalAmount <= maxAmount;
        });

        // Status filter (Active/Overdue/Settled)
        filtered = filtered.filter(loan => {
            const returnDate = loan.returnDate ? new Date(loan.returnDate) : null;
            const isOverdue = returnDate && returnDate < today;
            const isSettled = loan.status === 'settled';

            if (overdueFilter === 'settled') return isSettled;

            // For other filters, generally exclude settled unless specified (or if 'all' means 'active + overdue')
            // User request: "no longer be as a active loan" -> implied hidden from default view
            if (isSettled && !searchQuery) return false;

            if (overdueFilter === 'overdue') return isOverdue;
            if (overdueFilter === 'active') return !isOverdue;

            return true; // 'all' (active + overdue)
        });

        // Product filter
        if (productFilter !== 'all') {
            filtered = filtered.filter(loan => loan.productType === productFilter);
        }

        // Date range filter
        if (dateFrom) {
            filtered = filtered.filter(loan => new Date(loan.loanDate) >= dateFrom);
        }
        if (dateTo) {
            const toDateEnd = new Date(dateTo);
            toDateEnd.setHours(23, 59, 59, 999);
            filtered = filtered.filter(loan => new Date(loan.loanDate) <= toDateEnd);
        }

        // Sorting
        filtered.sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'date') {
                comparison = new Date(b.loanDate).getTime() - new Date(a.loanDate).getTime();
            } else if (sortBy === 'amount') {
                const aTotal = a.loanAmount + (a.additionalLoans?.reduce((sum, add) => sum + add.amount, 0) || 0);
                const bTotal = b.loanAmount + (b.additionalLoans?.reduce((sum, add) => sum + add.amount, 0) || 0);
                comparison = bTotal - aTotal;
            }
            return sortOrder === 'desc' ? comparison : -comparison;
        });

        return filtered;
    }, [loans, searchQuery, minAmount, maxAmount, amountAboveLakh, overdueFilter, productFilter, dateFrom, dateTo, sortBy, sortOrder]);

    // Check if any filter is active
    const hasActiveFilters = minAmount > 1000 || maxAmount < 100000 || amountAboveLakh || overdueFilter !== 'all' || productFilter !== 'all' || dateFrom || dateTo || sortBy !== 'date';

    const productTypes = ['Earring', 'Necklace', 'Chain', 'Bangle', 'Ring', 'Bracelet', 'Pendant', 'Other'];

    // Settle Loan Function
    const handleSettle = async (loan: Loan, autoPrint: boolean = false) => {
        try {
            const res = await fetch(`/api/loans/${loan.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'settled', returnDate: new Date().toISOString() })
            });

            if (res.ok) {
                const updated = await res.json();
                setLoans(loans.map(l => l.id === updated.id ? updated : l));
                setViewingLoan(updated);

                // Open settlement receipt and print if requested
                setPrintLoan(updated);
                setPrintType('settlement');
                setShowPrintModal(true);

                if (autoPrint) {
                    setTimeout(() => window.print(), 500);
                }
            }
        } catch (err) {
            console.error('Failed to settle loan:', err);
        }
    };

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
                <div className="flex gap-2 md:gap-3 mb-6">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, bill, phone..."
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
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setCustomerPhone(val);
                                            if (val.length === 10) {
                                                const existing = loans.find(l => l.customerPhone === val);
                                                if (existing) {
                                                    setCustomerName(existing.customerName);
                                                    setCustomerAddress(existing.customerAddress || '');
                                                    if (existing.customerAadhaar) setCustomerAadhaar(existing.customerAadhaar);
                                                }
                                            }
                                        }}
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
                                            if (val.length === 12) {
                                                const existing = loans.find(l => l.customerAadhaar && l.customerAadhaar.replace(/\s/g, '') === val);
                                                if (existing) {
                                                    setCustomerName(existing.customerName);
                                                    setCustomerAddress(existing.customerAddress || '');
                                                    setCustomerPhone(existing.customerPhone || '');
                                                }
                                            }
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

                {/* Section Header with Filter */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs md:text-sm font-black text-gray-600 uppercase tracking-[0.15em] flex items-center gap-2">
                        <Wallet size={16} className="text-[#D4AF37]" />
                        Active Gold Loans
                        <span className="text-gray-400 font-bold">({filteredLoans.length})</span>
                    </h3>

                    {/* Filter Button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowFilterPopup(!showFilterPopup)}
                            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black uppercase text-xs tracking-wider transition-all ${showFilterPopup || hasActiveFilters
                                ? 'bg-[#D4AF37] text-white shadow-lg'
                                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#D4AF37] shadow-sm'
                                }`}
                        >
                            <Filter size={14} />
                            <span>Filter</span>
                            {hasActiveFilters && (
                                <span className="w-2 h-2 bg-white rounded-full"></span>
                            )}
                        </button>

                        {/* Filter Popup */}
                        {showFilterPopup && (
                            <>
                                <div className="fixed inset-0 z-[90] bg-black/20 backdrop-blur-sm" onClick={() => setShowFilterPopup(false)}></div>
                                <div className="fixed inset-y-0 right-0 z-[100] w-full md:w-96 bg-white shadow-2xl border-l border-gray-100 overflow-hidden animate-in slide-in-from-right duration-300 flex flex-col h-full">
                                    <div className="bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 px-5 py-4 border-b border-[#D4AF37]/20 flex-shrink-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                                                <Filter size={16} className="text-[#D4AF37]" />
                                                Filter Loans
                                            </h3>
                                            <button onClick={() => setShowFilterPopup(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                                                <X size={16} className="text-gray-400" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-5 space-y-6 flex-1 overflow-y-auto">
                                        {/* Sort By */}
                                        <div>
                                            <label className="flex items-center gap-1.5 text-[10px] font-black text-[#B8860B] uppercase tracking-widest mb-2">
                                                <ArrowUpDown size={12} />
                                                Sort By
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => setSortBy('date')}
                                                    className={`px-4 py-3 rounded-xl text-xs font-bold transition-all ${sortBy === 'date' ? 'bg-[#D4AF37] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                >
                                                    📅 Date
                                                </button>
                                                <button
                                                    onClick={() => setSortBy('amount')}
                                                    className={`px-4 py-3 rounded-xl text-xs font-bold transition-all ${sortBy === 'amount' ? 'bg-[#D4AF37] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                >
                                                    💰 Amount
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                                                className="mt-2 w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-100"
                                            >
                                                {sortOrder === 'desc' ? '↓ Highest/Newest First' : '↑ Lowest/Oldest First'}
                                            </button>
                                        </div>

                                        {/* Amount Range with Slider */}
                                        <div>
                                            <label className="flex items-center gap-1.5 text-[10px] font-black text-[#B8860B] uppercase tracking-widest mb-3">
                                                <IndianRupee size={12} />
                                                Amount Range
                                            </label>

                                            {/* Above 1 Lakh Toggle */}


                                            <div className="relative pt-2 pb-6">
                                                <style>{`
                                                    .custom-range-slider {
                                                        -webkit-appearance: none;
                                                        appearance: none;
                                                        height: 4px;
                                                        width: 100%;
                                                        position: absolute;
                                                        background: transparent;
                                                        pointer-events: none;
                                                        z-index: 20;
                                                    }
                                                    .custom-range-slider {
                                                        -webkit-appearance: none;
                                                        appearance: none;
                                                        height: 24px;
                                                        width: 100%;
                                                        position: absolute;
                                                        background: transparent;
                                                        pointer-events: none;
                                                        z-index: 20;
                                                        top: 0;
                                                        margin: 0;
                                                    }
                                                    .custom-range-slider::-webkit-slider-thumb {
                                                        -webkit-appearance: none;
                                                        height: 24px;
                                                        width: 24px;
                                                        border-radius: 50%;
                                                        background: #ffffff;
                                                        border: 6px solid #D4AF37;
                                                        cursor: pointer;
                                                        pointer-events: auto;
                                                        margin-top: 0;
                                                        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                                                        position: relative;
                                                        z-index: 30;
                                                    }
                                                `}</style>

                                                <div className="flex justify-between items-center mb-6">
                                                    <span className="text-xl font-black text-gray-800">
                                                        ₹{minAmount.toLocaleString('en-IN')} – ₹{maxAmount.toLocaleString('en-IN')}
                                                    </span>
                                                </div>

                                                <div className={`relative h-6 flex items-center mb-6 ${amountAboveLakh ? 'opacity-40 pointer-events-none' : ''}`}>
                                                    {/* Background Track */}
                                                    <div className="absolute w-full h-1 bg-gray-200 rounded-full z-0"></div>

                                                    {/* Active Range Track */}
                                                    <div
                                                        className="absolute h-1 bg-[#D4AF37] z-10"
                                                        style={{
                                                            left: `${(minAmount / 100000) * 100}%`,
                                                            right: `${100 - (maxAmount / 100000) * 100}%`
                                                        }}
                                                    ></div>

                                                    {/* Min Slider */}
                                                    <input
                                                        type="range"
                                                        min={0}
                                                        max={100000}
                                                        step={1000}
                                                        value={minAmount}
                                                        onChange={(e) => {
                                                            const val = Math.min(Number(e.target.value), maxAmount - 1000);
                                                            setMinAmount(val);
                                                        }}
                                                        className="custom-range-slider"
                                                    />

                                                    {/* Max Slider */}
                                                    <input
                                                        type="range"
                                                        min={0}
                                                        max={100000}
                                                        step={1000}
                                                        value={maxAmount}
                                                        onChange={(e) => {
                                                            const val = Math.max(Number(e.target.value), minAmount + 1000);
                                                            setMaxAmount(val);
                                                        }}
                                                        className="custom-range-slider"
                                                    />
                                                </div>

                                                {/* Above 1 Lakh Toggle */}
                                                <button
                                                    onClick={() => setAmountAboveLakh(!amountAboveLakh)}
                                                    className={`w-full px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${amountAboveLakh ? 'bg-[#D4AF37] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                >
                                                    {amountAboveLakh ? <CheckCircle size={16} /> : <Circle size={16} />}
                                                    Show Loans Above ₹1 Lakh
                                                </button>
                                            </div>
                                        </div>

                                        {/* Date Range with CustomDatePicker */}
                                        <div>
                                            <label className="flex items-center gap-1.5 text-[10px] font-black text-[#B8860B] uppercase tracking-widest mb-2">
                                                <Calendar size={12} />
                                                Date Range
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <span className="text-[9px] text-gray-400 font-bold block mb-1">From</span>
                                                    <CustomDatePicker
                                                        selected={dateFrom}
                                                        onChange={(date) => setDateFrom(date)}
                                                        maxDate={dateTo || new Date()}
                                                    />
                                                </div>
                                                <div>
                                                    <span className="text-[9px] text-gray-400 font-bold block mb-1">To</span>
                                                    <CustomDatePicker
                                                        selected={dateTo}
                                                        onChange={(date) => setDateTo(date)}
                                                        minDate={dateFrom || undefined}
                                                        maxDate={new Date()}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Filter */}
                                        <div>
                                            <label className="flex items-center gap-1.5 text-[10px] font-black text-[#B8860B] uppercase tracking-widest mb-2">
                                                <AlertCircle size={12} />
                                                Status
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                {[
                                                    { value: 'all', label: 'All' },
                                                    { value: 'active', label: '✓ Active' },
                                                    { value: 'overdue', label: '⚠ Overdue' },
                                                    { value: 'settled', label: '✓ Settled' },
                                                ].map(opt => (
                                                    <button
                                                        key={opt.value}
                                                        onClick={() => setOverdueFilter(opt.value as typeof overdueFilter)}
                                                        className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${overdueFilter === opt.value ? 'bg-[#D4AF37] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Product Type */}
                                        <div>
                                            <label className="flex items-center gap-1.5 text-[10px] font-black text-[#B8860B] uppercase tracking-widest mb-2">
                                                <Clock size={12} />
                                                Product Type
                                            </label>
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => setProductFilter('all')}
                                                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${productFilter === 'all' ? 'bg-[#D4AF37] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                >
                                                    All
                                                </button>
                                                {productTypes.map(type => (
                                                    <button
                                                        key={type}
                                                        onClick={() => setProductFilter(type)}
                                                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${productFilter === type ? 'bg-[#D4AF37] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="px-5 pt-4 pb-8 md:py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                        <button
                                            onClick={() => {
                                                setSortBy('date');
                                                setSortOrder('desc');
                                                setMinAmount(1000);
                                                setMaxAmount(100000);
                                                setAmountAboveLakh(false);
                                                setOverdueFilter('all');
                                                setProductFilter('all');
                                                setDateFrom(null);
                                                setDateTo(null);
                                            }}
                                            className="text-xs font-black text-red-500 uppercase tracking-widest hover:text-red-600 hover:underline"
                                        >
                                            Reset All
                                        </button>
                                        <button
                                            onClick={() => setShowFilterPopup(false)}
                                            className="px-6 py-2.5 bg-[#D4AF37] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#B8860B] transition-all"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                    <div className="mb-4 flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active:</span>
                        {sortBy !== 'date' && (
                            <span className="px-2 py-1 bg-[#D4AF37]/10 text-[#B8860B] rounded-lg text-[10px] font-bold">Sorted by {sortBy}</span>
                        )}
                        {amountAboveLakh && (
                            <span className="px-2 py-1 bg-[#D4AF37]/10 text-[#B8860B] rounded-lg text-[10px] font-bold">
                                &gt; ₹1 Lakh
                            </span>
                        )}
                        {!amountAboveLakh && (minAmount > 1000 || maxAmount < 100000) && (
                            <span className="px-2 py-1 bg-[#D4AF37]/10 text-[#B8860B] rounded-lg text-[10px] font-bold">
                                ₹{minAmount.toLocaleString('en-IN')} - ₹{maxAmount.toLocaleString('en-IN')}
                            </span>
                        )}
                        {overdueFilter !== 'all' && (
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${overdueFilter === 'overdue' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                {overdueFilter === 'overdue' ? 'Overdue' : overdueFilter === 'settled' ? 'Settled' : 'Active'}
                            </span>
                        )}
                        {productFilter !== 'all' && (
                            <span className="px-2 py-1 bg-[#D4AF37]/10 text-[#B8860B] rounded-lg text-[10px] font-bold">{productFilter}</span>
                        )}
                        {(dateFrom || dateTo) && (
                            <span className="px-2 py-1 bg-[#D4AF37]/10 text-[#B8860B] rounded-lg text-[10px] font-bold">
                                {dateFrom && dateTo
                                    ? `${dateFrom.toLocaleDateString('en-IN')} → ${dateTo.toLocaleDateString('en-IN')}`
                                    : dateFrom
                                        ? `From ${dateFrom.toLocaleDateString('en-IN')}`
                                        : `Until ${dateTo?.toLocaleDateString('en-IN')}`}
                            </span>
                        )}
                        <button
                            onClick={() => {
                                setSortBy('date');
                                setSortOrder('desc');
                                setMinAmount(1000);
                                setMaxAmount(100000);
                                setAmountAboveLakh(false);
                                setOverdueFilter('all');
                                setProductFilter('all');
                                setDateFrom(null);
                                setDateTo(null);
                            }}
                            className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline ml-2"
                        >
                            Clear All
                        </button>
                    </div>
                )}

                {/* Loan Cards - 2 Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {loading ? (
                        <div className="col-span-2 flex items-center justify-center py-16">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
                        </div>
                    ) : filteredLoans.length === 0 ? (
                        <div className="col-span-2 text-center py-16 bg-white rounded-2xl border border-gray-100">
                            <Filter size={20} className="text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No loans found</p>
                        </div>
                    ) : (
                        filteredLoans.map((loan) => {
                            const summary = calculateSummary(loan);
                            const isOverdue = loan.returnDate && new Date(loan.returnDate) < new Date();
                            const loanDate = new Date(loan.loanDate);
                            const formattedDate = `${loanDate.getDate().toString().padStart(2, '0')}-${(loanDate.getMonth() + 1).toString().padStart(2, '0')}-${loanDate.getFullYear()}`;

                            return (
                                <div
                                    key={loan.id}
                                    className={`bg-white rounded-xl border p-4 hover:shadow-md transition-all cursor-pointer group ${isOverdue ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}
                                    onClick={() => openDetails(loan)}
                                >
                                    {/* Row 1: Name + Bill Number + Amount */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <p className="font-black text-gray-800 uppercase text-base truncate group-hover:text-[#D4AF37] transition-colors">
                                                {loan.customerName}
                                            </p>
                                            <span className="text-[10px] text-[#B8860B] font-bold shrink-0">
                                                {loan.billNumber}
                                            </span>
                                        </div>
                                        <p className={`text-xl font-black ml-2 shrink-0 ${isOverdue ? 'text-red-500' : 'text-[#D4AF37]'}`}>
                                            ₹{summary.totalPayable.toLocaleString('en-IN')}
                                        </p>
                                    </div>

                                    {/* Row 2: Date + Product Type - Grams */}
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-gray-400 font-bold">
                                            {formattedDate}
                                        </p>
                                        <span className="text-xs text-gray-400 font-bold uppercase">
                                            {loan.productType}{loan.productWeight ? ` - ${loan.productWeight}g` : ''}
                                        </span>
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
                        <div className="bg-[#333333] text-white px-4 py-3 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-4">
                                <button onClick={() => { setShowDetailsModal(false); setEditForm({}); }} className="p-2 hover:bg-white/10 rounded-xl">
                                    <X size={20} />
                                </button>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">{viewingLoan.billNumber}</p>
                                    <h3 className="text-lg font-black uppercase text-white tracking-wide">{viewingLoan.customerName}</h3>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {/* Removed Save/Cancel as requested */}
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="max-w-4xl mx-auto p-4 md:p-8">
                                {/* Large Summary Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col justify-center h-full">
                                        <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Principal</p>
                                        <p className="text-3xl md:text-4xl font-black text-gray-800">₹{summary.totalPrincipal.toLocaleString()}</p>
                                    </div>
                                    <div className={`p-4 rounded-2xl text-center border flex flex-col justify-center h-full ${viewingLoan.status === 'settled' ? 'bg-gray-50 border-gray-200' : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'}`}>
                                        <p className={`text-[10px] md:text-xs font-black uppercase tracking-widest mb-1 ${viewingLoan.status === 'settled' ? 'text-gray-500' : 'text-orange-600'}`}>
                                            {viewingLoan.status === 'settled' ? 'INTEREST PAID' : 'Interest Due'}
                                        </p>
                                        <p className={`text-3xl md:text-4xl font-black ${viewingLoan.status === 'settled' ? 'text-gray-700' : 'text-orange-600'}`}>₹{summary.totalInterest.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/30 p-4 rounded-2xl text-center border border-[#D4AF37]/40 flex flex-col justify-center h-full">
                                        <p className="text-[10px] md:text-xs font-black text-[#B8860B] uppercase tracking-widest mb-1">{viewingLoan.status === 'settled' ? 'TOTAL PAID' : 'Total Payable'}</p>
                                        <p className="text-3xl md:text-4xl font-black text-[#B8860B]">₹{summary.totalPayable.toLocaleString()}</p>
                                    </div>
                                    <div className={`p-4 rounded-2xl text-center border flex flex-col justify-center h-full ${viewingLoan.status === 'settled' ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'}`}>
                                        <p className={`text-[10px] md:text-xs font-black uppercase tracking-widest mb-1 ${viewingLoan.status === 'settled' ? 'text-emerald-600' : 'text-blue-600'}`}>Status</p>
                                        <p className={`text-2xl md:text-3xl font-black ${viewingLoan.status === 'settled' ? 'text-emerald-600' : 'text-blue-600'}`}>
                                            {viewingLoan.status === 'settled' ? 'CLOSED' : 'ACTIVE'}
                                        </p>
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
                                        <div className="p-6 space-y-5">
                                            <div className="space-y-1">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Name</span>
                                                {editForm.id === viewingLoan.id ? (
                                                    <input
                                                        type="text"
                                                        value={editForm.customerName || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all uppercase"
                                                    />
                                                ) : (
                                                    <p className="text-sm font-black text-gray-800 uppercase pl-1">{viewingLoan.customerName}</p>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</span>
                                                {editForm.id === viewingLoan.id ? (
                                                    <input
                                                        type="tel"
                                                        inputMode="numeric"
                                                        maxLength={10}
                                                        value={editForm.customerPhone || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                                                        placeholder="10 digits"
                                                    />
                                                ) : (
                                                    <p className="text-sm font-bold text-gray-800 pl-1">{viewingLoan.customerPhone || 'Not provided'}</p>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Aadhaar</span>
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
                                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                                                        placeholder="0000 0000 0000"
                                                    />
                                                ) : (
                                                    <p className="text-sm font-bold text-gray-800 pl-1">{viewingLoan.customerAadhaar || 'Not provided'}</p>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Address</span>
                                                {editForm.id === viewingLoan.id ? (
                                                    <textarea
                                                        value={editForm.customerAddress || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, customerAddress: e.target.value })}
                                                        rows={4}
                                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all resize-none"
                                                    />
                                                ) : (
                                                    <p className="text-sm font-bold text-gray-800 pl-1 leading-relaxed">{viewingLoan.customerAddress || 'Not provided'}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Asset Details Card */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                                            <h4 className="text-xs font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
                                                <Wallet size={16} className="text-[#D4AF37]" />
                                                Asset Details
                                            </h4>
                                        </div>
                                        <div className="p-6 space-y-5">
                                            <div className="space-y-1">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Product</span>
                                                {editForm.id === viewingLoan.id ? (
                                                    <div className="relative">
                                                        <select value={editForm.productType || ''} onChange={(e) => setEditForm({ ...editForm, productType: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all appearance-none">
                                                            <option value="Earring">Earring</option>
                                                            <option value="Necklace">Necklace</option>
                                                            <option value="Chain">Chain</option>
                                                            <option value="Bangle">Bangle</option>
                                                            <option value="Ring">Ring</option>
                                                            <option value="Bracelet">Bracelet</option>
                                                            <option value="Pendant">Pendant</option>
                                                            <option value="Other">Other</option>
                                                        </select>
                                                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                    </div>
                                                ) : (
                                                    <p className="text-sm font-black text-gray-800 pl-1">{viewingLoan.productType}</p>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Weight (g)</span>
                                                {editForm.id === viewingLoan.id ? (
                                                    <input
                                                        type="text"
                                                        inputMode="decimal"
                                                        value={editForm.productWeight || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, productWeight: parseFloat(e.target.value.replace(/[^\d.]/g, '')) || 0 })}
                                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                                                        placeholder="Grams"
                                                    />
                                                ) : (
                                                    <p className="text-sm font-bold text-gray-800 pl-1">{viewingLoan.productWeight ? `${viewingLoan.productWeight}g` : 'N/A'}</p>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Interest Rate</span>
                                                {editForm.id === viewingLoan.id ? (
                                                    <div className="relative">
                                                        <input type="text" inputMode="decimal" value={editForm.interestRate || ''} onChange={(e) => setEditForm({ ...editForm, interestRate: parseFloat(e.target.value.replace(/[^\d.]/g, '')) || 0 })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all pr-12" />
                                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">%/m</span>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm font-bold text-gray-800 pl-1">{viewingLoan.interestRate}%/m</p>
                                                )}
                                            </div>
                                            <div className="space-y-1 relative z-[150]">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Expected Return</span>
                                                {editForm.id === viewingLoan.id ? (
                                                    <div className="relative z-[150]">
                                                        <CustomDatePicker
                                                            selected={editForm.returnDate ? new Date(editForm.returnDate) : (viewingLoan.returnDate ? new Date(viewingLoan.returnDate) : new Date())}
                                                            onChange={(date) => setEditForm({ ...editForm, returnDate: date.toISOString().split('T')[0] })}
                                                            align="left"
                                                            minDate={editForm.loanDate ? new Date(editForm.loanDate) : new Date(viewingLoan.loanDate)}
                                                        />
                                                    </div>
                                                ) : (
                                                    <p className={`text-sm font-bold pl-1 ${isOverdue ? 'text-red-500' : 'text-gray-800'}`}>
                                                        {viewingLoan.returnDate ? new Date(viewingLoan.returnDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not set'}
                                                        {isOverdue && ' (OVERDUE)'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Loan Details List */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible mb-6 relative z-[50]">
                                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                        <h4 className="text-xs font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
                                            <IndianRupee size={16} className="text-[#D4AF37]" />
                                            Loan Details ({1 + (viewingLoan.additionalLoans?.length || 0)})
                                        </h4>
                                        <div className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-[10px] font-black uppercase text-amber-500 flex items-center gap-2 shadow-sm">
                                            <span className="text-gray-400">Rate:</span>
                                            {editForm.id === viewingLoan.id ? (
                                                <div className="relative w-12 h-5">
                                                    <input
                                                        type="text"
                                                        value={editForm.interestRate || ''}
                                                        onChange={(e) => setEditForm({ ...editForm, interestRate: e.target.value as any })}
                                                        className="w-full h-full bg-gray-800 text-amber-500 text-center rounded outline-none focus:ring-1 focus:ring-amber-500/50 transition-all cursor-text"
                                                    />
                                                </div>
                                            ) : (
                                                <span className="text-white">{viewingLoan.interestRate}%</span>
                                            )}
                                            <span className="text-gray-500">/ Month</span>
                                        </div>
                                    </div>

                                    <div className="p-6 overflow-visible">
                                        {/* Column Headers - Hidden on Mobile */}
                                        <div className="hidden md:grid grid-cols-12 gap-4 px-4 mb-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <div className="col-span-1">#</div>
                                            <div className="col-span-3">Principal</div>
                                            <div className="col-span-4">Date</div>
                                            <div className="col-span-2">Months</div>
                                            <div className="col-span-2 text-right">Interest</div>
                                        </div>

                                        <div className="space-y-3">
                                            {/* Base Loan Entry - Always First */}
                                            <div className={`p-4 ${editForm.id === viewingLoan.id ? 'bg-amber-50 border-2 border-[#D4AF37]/30' : 'bg-gray-50'} rounded-2xl transition-all`}>
                                                {/* Mobile View */}
                                                <div className="md:hidden flex flex-col gap-2">
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center font-black text-[#D4AF37] text-xs">1</div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Principal</p>
                                                                {editForm.id === viewingLoan.id ? (
                                                                    <div className="relative w-32">
                                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                                                                        <input
                                                                            type="text"
                                                                            value={editForm.loanAmount}
                                                                            onChange={(e) => setEditForm({ ...editForm, loanAmount: parseFloat(e.target.value) || 0 })}
                                                                            className="w-full pl-5 pr-2 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-800 outline-none focus:border-[#D4AF37]"
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-lg font-black text-gray-800">₹{viewingLoan.loanAmount.toLocaleString()}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Interest</p>
                                                            <p className="text-base font-black text-amber-600">₹{Math.round(Number(viewingLoan.loanAmount) * (Number(editForm.interestRate || viewingLoan.interestRate) / 100) * Number(summary.baseMonths)).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 pl-[44px]">
                                                        {editForm.id === viewingLoan.id ? (
                                                            <div className="w-full">
                                                                <CustomDatePicker
                                                                    selected={editForm.loanDate ? new Date(editForm.loanDate) : new Date(viewingLoan.loanDate)}
                                                                    onChange={(date) => setEditForm({ ...editForm, loanDate: date.toISOString().split('T')[0] })}
                                                                    maxDate={new Date()}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs font-bold text-gray-500">
                                                                {new Date(viewingLoan.loanDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })} • {summary.baseMonths}m
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Desktop View */}
                                                <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                                                    {/* Index */}
                                                    <div className="col-span-1">
                                                        <div className="w-8 h-8 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center font-black text-[#D4AF37] text-xs">1</div>
                                                    </div>

                                                    {/* Principal */}
                                                    <div className="col-span-3">
                                                        {editForm.id === viewingLoan.id ? (
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                                                                <input
                                                                    type="text"
                                                                    value={editForm.loanAmount}
                                                                    onChange={(e) => setEditForm({ ...editForm, loanAmount: parseFloat(e.target.value) || 0 })}
                                                                    className="w-full pl-6 pr-2 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-800 outline-none focus:border-[#D4AF37]"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm font-black text-gray-800">₹{viewingLoan.loanAmount.toLocaleString()}</div>
                                                        )}
                                                    </div>

                                                    {/* Date */}
                                                    <div className="col-span-4">
                                                        {editForm.id === viewingLoan.id ? (
                                                            <div className="relative w-full">
                                                                <CustomDatePicker
                                                                    selected={editForm.loanDate ? new Date(editForm.loanDate) : new Date(viewingLoan.loanDate)}
                                                                    onChange={(date) => setEditForm({ ...editForm, loanDate: date.toISOString().split('T')[0] })}
                                                                    maxDate={new Date()}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="text-sm font-bold text-gray-500">{new Date(viewingLoan.loanDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</div>
                                                        )}
                                                    </div>

                                                    {/* Months */}
                                                    <div className="col-span-2">
                                                        <div className="text-sm font-bold text-gray-500">{summary.baseMonths}m</div>
                                                    </div>

                                                    {/* Interest */}
                                                    <div className="col-span-2 text-right">
                                                        <div className="text-sm font-black text-amber-600">₹{Math.round(Number(viewingLoan.loanAmount) * (Number(editForm.interestRate || viewingLoan.interestRate) / 100) * Number(summary.baseMonths)).toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Additional Loans */}
                                            {(editForm.id === viewingLoan.id ? editForm.additionalLoans : viewingLoan.additionalLoans)?.map((add, idx) => {
                                                const addDate = new Date(add.date);
                                                const addMonths = Math.abs(new Date().getTime() - addDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
                                                const currentRate = parseFloat(editForm.interestRate?.toString() || viewingLoan.interestRate.toString());
                                                const addInterest = add.amount * (currentRate / 100) * addMonths;

                                                return (
                                                    <div key={add.id || idx} className={`p-4 ${editForm.id === viewingLoan.id ? 'bg-amber-50 border-2 border-[#D4AF37]/30' : 'bg-gray-50'} rounded-2xl transition-all relative group`}>
                                                        {/* Mobile View */}
                                                        <div className="md:hidden flex flex-col gap-2">
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center font-black text-[#D4AF37] text-xs transition-colors group-hover:bg-[#D4AF37] group-hover:text-white">{idx + 2}</div>
                                                                    <div>
                                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Principal</p>
                                                                        {editForm.id === viewingLoan.id ? (
                                                                            <div className="relative w-32">
                                                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                                                                                <input
                                                                                    type="text"
                                                                                    value={add.amount}
                                                                                    onChange={(e) => {
                                                                                        const newAmount = parseFloat(e.target.value) || 0;
                                                                                        const updated = [...(editForm.additionalLoans || [])];
                                                                                        updated[idx] = { ...updated[idx], amount: newAmount };
                                                                                        setEditForm({ ...editForm, additionalLoans: updated });
                                                                                    }}
                                                                                    className="w-full pl-5 pr-2 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-800 outline-none focus:border-[#D4AF37]"
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-lg font-black text-gray-800">₹{add.amount.toLocaleString()}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Interest</p>
                                                                    <p className="text-base font-black text-amber-600">₹{Math.round(addInterest).toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 pl-[44px]">
                                                                {editForm.id === viewingLoan.id ? (
                                                                    <div className="w-full">
                                                                        <CustomDatePicker
                                                                            selected={new Date(add.date)}
                                                                            onChange={(date) => {
                                                                                if (!date) return;
                                                                                const updated = [...(editForm.additionalLoans || [])];
                                                                                updated[idx] = { ...updated[idx], date: date.toISOString().split('T')[0] };
                                                                                setEditForm({ ...editForm, additionalLoans: updated });
                                                                            }}
                                                                            maxDate={new Date()}
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-xs font-bold text-gray-500">
                                                                        {addDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })} • {addMonths.toFixed(1)}m
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Desktop View */}
                                                        <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                                                            {/* Index */}
                                                            <div className="col-span-1">
                                                                <div className="w-8 h-8 bg-[#D4AF37]/10 rounded-lg flex items-center justify-center font-black text-[#D4AF37] text-xs transition-colors group-hover:bg-[#D4AF37] group-hover:text-white">{idx + 2}</div>
                                                            </div>

                                                            {/* Principal */}
                                                            <div className="col-span-3">
                                                                {editForm.id === viewingLoan.id ? (
                                                                    <div className="relative">
                                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                                                                        <input
                                                                            type="text"
                                                                            value={add.amount}
                                                                            onChange={(e) => {
                                                                                const newAmount = parseFloat(e.target.value) || 0;
                                                                                const updated = [...(editForm.additionalLoans || [])];
                                                                                updated[idx] = { ...updated[idx], amount: newAmount };
                                                                                setEditForm({ ...editForm, additionalLoans: updated });
                                                                            }}
                                                                            className="w-full pl-6 pr-2 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-800 outline-none focus:border-[#D4AF37]"
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-sm font-black text-gray-800">₹{add.amount.toLocaleString()}</div>
                                                                )}
                                                            </div>

                                                            {/* Date */}
                                                            <div className="col-span-4">
                                                                {editForm.id === viewingLoan.id ? (
                                                                    <div className="relative w-full">
                                                                        <CustomDatePicker
                                                                            selected={new Date(add.date)}
                                                                            onChange={(date) => {
                                                                                if (!date) return;
                                                                                const updated = [...(editForm.additionalLoans || [])];
                                                                                updated[idx] = { ...updated[idx], date: date.toISOString().split('T')[0] };
                                                                                setEditForm({ ...editForm, additionalLoans: updated });
                                                                            }}
                                                                            maxDate={new Date()}
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-sm font-bold text-gray-500">{addDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })}</div>
                                                                )}
                                                            </div>

                                                            {/* Months */}
                                                            <div className="col-span-2">
                                                                <div className="text-sm font-bold text-gray-500">{addMonths.toFixed(1)}m</div>
                                                            </div>

                                                            {/* Interest */}
                                                            <div className="col-span-2 text-right">
                                                                <div className="text-sm font-black text-amber-600">₹{Math.round(addInterest).toLocaleString()}</div>
                                                            </div>
                                                        </div>

                                                        {/* Delete Button */}
                                                        {editForm.id === viewingLoan.id && (
                                                            <button
                                                                onClick={() => {
                                                                    const updated = (editForm.additionalLoans || []).filter((_, i) => i !== idx);
                                                                    setEditForm({ ...editForm, additionalLoans: updated });
                                                                }}
                                                                className="absolute -right-2 top-1/2 -translate-y-1/2 p-2 bg-red-100 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:scale-110"
                                                                title="Delete Loan"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Card Footer with Totals */}
                                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 rounded-b-2xl">
                                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                            <div className="flex items-center gap-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Principal</span>
                                                    <span className="text-lg font-black text-gray-800">₹{summary.totalPrincipal.toLocaleString()}</span>
                                                </div>
                                                <div className="w-px h-8 bg-gray-200"></div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{viewingLoan.status === 'settled' ? 'Interest Paid' : 'Total Interest'}</span>
                                                    <span className={`text-lg font-black ${viewingLoan.status === 'settled' ? 'text-gray-800' : 'text-amber-600'}`}>₹{summary.totalInterest.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{viewingLoan.status === 'settled' ? 'Total Paid' : 'Total Payable'}</span>
                                                <span className="text-xl font-black text-[#D4AF37]">₹{summary.totalPayable.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Add New Additional Loan - Separate Card */}
                                {viewingLoan.status !== 'settled' && (
                                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible mb-8 relative z-[40]">
                                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                            <h4 className="text-xs font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
                                                <Plus size={16} className="text-[#D4AF37]" />
                                                Add Extra Loan
                                            </h4>
                                        </div>
                                        <div className="p-6 overflow-visible">
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
                                                            className="w-full pl-8 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-800 focus:border-[#D4AF37] outline-none transition-all placeholder:text-gray-300 h-full"
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
                                                        className="w-full md:w-auto h-full px-8 py-3 bg-[#333] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg"
                                                    >
                                                        <Plus size={14} /> Add Loan
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
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
                                            className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all"
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
                                        {viewingLoan.status !== 'settled' && (
                                            <button
                                                onClick={() => setEditForm({
                                                    ...viewingLoan,
                                                    additionalLoans: viewingLoan.additionalLoans?.map(l => ({ ...l })) || []
                                                })}
                                                className="flex-1 py-4 bg-blue-500 text-white rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-2 hover:bg-blue-600 transition-all"
                                            >
                                                Edit Details
                                            </button>
                                        )}
                                        {viewingLoan.status === 'settled' ? (
                                            <button
                                                onClick={() => {
                                                    setPrintLoan(viewingLoan);
                                                    setPrintType('settlement');
                                                    setShowPrintModal(true);
                                                }}
                                                className="flex-1 py-4 bg-gray-800 text-white rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg"
                                            >
                                                <Printer size={18} /> Receipt
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setPrintLoan({ ...viewingLoan, returnDate: new Date().toISOString() });
                                                    setPrintType('settlement');
                                                    setShowPrintModal(true);
                                                }}
                                                className="flex-1 py-4 bg-[#D4AF37] text-white rounded-2xl font-black text-sm uppercase flex items-center justify-center gap-2 hover:bg-[#B8860B] transition-all shadow-lg shadow-amber-200/30"
                                            >
                                                <Wallet size={18} /> Settle Now
                                            </button>
                                        )}
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



            {/* Print Modal */}
            {
                showPrintModal && printLoan && (() => {
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
                                            onClick={() => {
                                                if (printLoan.status !== 'settled' && printType === 'settlement') {
                                                    handleSettle(printLoan, true);
                                                } else {
                                                    window.print();
                                                }
                                            }}
                                            className="flex-1 md:flex-none bg-[#D4AF37] text-white px-4 md:px-6 py-3 md:py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#B8860B] transition-all shadow-lg shadow-amber-200"
                                        >
                                            <Printer size={14} />
                                            {printLoan.status !== 'settled' && printType === 'settlement' ? 'Settle & Print' : 'Print'}
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
                })()
            }

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
        </main >
    );
}
