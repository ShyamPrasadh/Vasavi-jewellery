'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import { useGoldRates } from '@/hooks/useGoldRates';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import {
    TrendingUp, Wallet, ChevronRight, Clock, AlertCircle,
    BarChart3, PieChart, Activity, X
} from 'lucide-react';

interface Loan {
    id: string;
    billNumber: string;
    customerName: string;
    customerPhone: string;
    loanAmount: number;
    productType: string;
    loanDate: string;
    returnDate: string;
    interestRate: number;
    additionalLoans: { id: string; amount: number; date: string }[];
}

type PeriodType = 'week' | 'month' | 'year' | 'all';

export default function DashboardPage() {
    const { rates } = useGoldRates();
    const { t, language } = useLanguage();
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');
    const [detailModal, setDetailModal] = useState<{ type: string; data: any } | null>(null);

    useEffect(() => {
        fetchLoans();
    }, []);

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

    const stats = useMemo(() => {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        const today = now.getTime();

        // Get start of week (Sunday)
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        // Filter loans by selected period
        const filteredLoans = loans.filter(loan => {
            const loanDate = new Date(loan.loanDate);
            if (selectedPeriod === 'week') {
                return loanDate >= startOfWeek;
            } else if (selectedPeriod === 'month') {
                return loanDate.getMonth() === thisMonth && loanDate.getFullYear() === thisYear;
            } else if (selectedPeriod === 'year') {
                return loanDate.getFullYear() === thisYear;
            }
            return true; // 'all'
        });

        // Calculate principal given in selected period (ONLY principal, no additional)
        let periodPrincipal = 0;
        filteredLoans.forEach(loan => {
            periodPrincipal += loan.loanAmount;
        });

        // Filter additional loans by period as well
        let periodAdditional = 0;
        filteredLoans.forEach(loan => {
            loan.additionalLoans?.forEach(add => {
                const addDate = new Date(add.date);
                if (selectedPeriod === 'week' && addDate >= startOfWeek) {
                    periodAdditional += add.amount;
                } else if (selectedPeriod === 'month' && addDate.getMonth() === thisMonth && addDate.getFullYear() === thisYear) {
                    periodAdditional += add.amount;
                } else if (selectedPeriod === 'year' && addDate.getFullYear() === thisYear) {
                    periodAdditional += add.amount;
                } else if (selectedPeriod === 'all') {
                    periodAdditional += add.amount;
                }
            });
        });

        // Calculate interest earned based on filtered loans
        let periodInterest = 0;
        filteredLoans.forEach(loan => {
            const start = new Date(loan.loanDate);
            const months = Math.abs(today - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
            periodInterest += loan.loanAmount * (loan.interestRate / 100) * months;
            loan.additionalLoans?.forEach(add => {
                const addDate = new Date(add.date);
                const addMonths = Math.abs(today - addDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
                periodInterest += add.amount * (loan.interestRate / 100) * addMonths;
            });
        });

        // Total outstanding (all active loans)
        let totalOutstanding = 0;
        loans.forEach(loan => {
            totalOutstanding += loan.loanAmount;
            loan.additionalLoans?.forEach(add => {
                totalOutstanding += add.amount;
            });
        });

        // Upcoming returns (within 30 days)
        const upcomingReturnsLoans = loans.filter(loan => {
            if (!loan.returnDate) return false;
            const returnDate = new Date(loan.returnDate);
            const daysUntil = (returnDate.getTime() - today) / (1000 * 60 * 60 * 24);
            return daysUntil >= 0 && daysUntil <= 30;
        });

        // Overdue loans
        const overdueLoansData = loans.filter(loan => {
            if (!loan.returnDate) return false;
            const returnDate = new Date(loan.returnDate);
            return returnDate.getTime() < today;
        });

        // Product distribution for filtered loans
        const productCounts: Record<string, number> = {};
        filteredLoans.forEach(loan => {
            productCounts[loan.productType] = (productCounts[loan.productType] || 0) + 1;
        });

        // Monthly trend (last 6 months) - always show all data
        const monthlyData: { month: string; amount: number; loans: Loan[] }[] = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const monthLoans = loans.filter(loan => {
                const loanDate = new Date(loan.loanDate);
                return loanDate.getMonth() === d.getMonth() && loanDate.getFullYear() === d.getFullYear();
            });
            let monthTotal = 0;
            monthLoans.forEach(l => {
                monthTotal += l.loanAmount;
            });
            monthlyData.push({
                month: d.toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', { month: 'short' }),
                amount: monthTotal,
                loans: monthLoans
            });
        }
        const maxMonthly = Math.max(...monthlyData.map(m => m.amount), 1);

        return {
            totalLoans: filteredLoans.length,
            periodPrincipal,
            periodAdditional,
            periodInterest: Math.round(periodInterest),
            totalOutstanding,
            activeLoans: loans.length,
            upcomingReturns: upcomingReturnsLoans.length,
            upcomingReturnsLoans,
            overdueLoans: overdueLoansData.length,
            overdueLoansData,
            productCounts,
            monthlyData,
            maxMonthly,
            filteredLoans,
            recentLoans: [...filteredLoans].sort((a, b) => new Date(b.loanDate).getTime() - new Date(a.loanDate).getTime()).slice(0, 5)
        };
    }, [loans, selectedPeriod, language]);

    const formatCurrency = (num: number) => {
        if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
        if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
        if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
        return `₹${num.toLocaleString()}`;
    };

    const periodLabels: Record<PeriodType, string> = {
        week: t('thisWeek'),
        month: t('thisMonth'),
        year: t('thisYear'),
        all: t('allTime')
    };

    const openDetailModal = (type: string, data: any) => {
        setDetailModal({ type, data });
    };

    return (
        <main className="min-h-screen bg-[#FDFCFB] pb-32 pt-[70px] md:pt-[80px]">
            <Header rates={rates || undefined} />

            <div className="max-w-7xl mx-auto px-4 md:px-6 mt-6 md:mt-8">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-800 uppercase tracking-tight">
                            {t('dashboard')}
                        </h1>
                        <p className="text-[10px] md:text-xs font-bold text-[#D4AF37] uppercase tracking-[0.2em] mt-1">
                            {t('businessOverview')}
                        </p>
                    </div>

                    {/* Period Selector */}
                    <div className="flex gap-1 mt-4 md:mt-0 bg-gray-100 p-1 rounded-xl overflow-x-auto">
                        {(['week', 'month', 'year', 'all'] as const).map(period => (
                            <button
                                key={period}
                                onClick={() => setSelectedPeriod(period)}
                                className={`px-3 md:px-4 py-2 rounded-lg text-[10px] md:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${selectedPeriod === period
                                    ? 'bg-[#D4AF37] text-white shadow-md'
                                    : 'text-gray-500 hover:text-gray-800'
                                    }`}
                            >
                                {periodLabels[period]}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D4AF37]"></div>
                    </div>
                ) : (
                    <>
                        {/* Main Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                            {/* Loans Given (Principal Only) */}
                            <div
                                onClick={() => openDetailModal('loansGiven', stats.filteredLoans)}
                                className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer"
                            >
                                <div className="absolute top-0 right-0 w-16 md:w-20 h-16 md:h-20 bg-gradient-to-bl from-[#D4AF37]/10 to-transparent rounded-bl-full"></div>
                                <div className="flex items-center gap-2 mb-2 md:mb-3">
                                    <div className="p-1.5 md:p-2 bg-[#D4AF37]/10 rounded-lg">
                                        <Wallet size={16} className="text-[#D4AF37]" />
                                    </div>
                                    <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('loansGiven')}</span>
                                </div>
                                <p className="text-xl md:text-3xl font-black text-gray-800">{formatCurrency(stats.periodPrincipal)}</p>
                                <p className="text-[9px] md:text-[10px] text-gray-400 mt-1 font-bold">{stats.totalLoans} {t('transactions')}</p>
                                <p className="text-[8px] md:text-[9px] text-[#D4AF37] font-bold mt-0.5">{t('principalOnly')}</p>
                            </div>

                            {/* Interest Earned */}
                            <div
                                onClick={() => openDetailModal('interest', stats.filteredLoans)}
                                className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer"
                            >
                                <div className="absolute top-0 right-0 w-16 md:w-20 h-16 md:h-20 bg-gradient-to-bl from-green-500/10 to-transparent rounded-bl-full"></div>
                                <div className="flex items-center gap-2 mb-2 md:mb-3">
                                    <div className="p-1.5 md:p-2 bg-green-500/10 rounded-lg">
                                        <TrendingUp size={16} className="text-green-500" />
                                    </div>
                                    <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('interestEarned')}</span>
                                </div>
                                <p className="text-xl md:text-3xl font-black text-green-600">{formatCurrency(stats.periodInterest)}</p>
                                <p className="text-[9px] md:text-[10px] text-gray-400 mt-1 font-bold">{t('earnedToDate')}</p>
                            </div>

                            {/* Outstanding */}
                            <div
                                onClick={() => openDetailModal('outstanding', loans)}
                                className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer"
                            >
                                <div className="absolute top-0 right-0 w-16 md:w-20 h-16 md:h-20 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full"></div>
                                <div className="flex items-center gap-2 mb-2 md:mb-3">
                                    <div className="p-1.5 md:p-2 bg-blue-500/10 rounded-lg">
                                        <BarChart3 size={16} className="text-blue-500" />
                                    </div>
                                    <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('outstanding')}</span>
                                </div>
                                <p className="text-xl md:text-3xl font-black text-blue-600">{formatCurrency(stats.totalOutstanding)}</p>
                                <p className="text-[9px] md:text-[10px] text-gray-400 mt-1 font-bold">{stats.activeLoans} {t('activeLoans')}</p>
                            </div>

                            {/* Alerts */}
                            <div
                                onClick={() => openDetailModal('alerts', { upcoming: stats.upcomingReturnsLoans, overdue: stats.overdueLoansData })}
                                className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-lg transition-all cursor-pointer"
                            >
                                <div className="absolute top-0 right-0 w-16 md:w-20 h-16 md:h-20 bg-gradient-to-bl from-red-500/10 to-transparent rounded-bl-full"></div>
                                <div className="flex items-center gap-2 mb-2 md:mb-3">
                                    <div className="p-1.5 md:p-2 bg-red-500/10 rounded-lg">
                                        <AlertCircle size={16} className="text-red-500" />
                                    </div>
                                    <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('alerts')}</span>
                                </div>
                                <div className="flex items-baseline gap-3">
                                    <div>
                                        <p className="text-xl md:text-2xl font-black text-orange-500">{stats.upcomingReturns}</p>
                                        <p className="text-[8px] md:text-[9px] text-gray-400 font-bold">{t('dueSoon')}</p>
                                    </div>
                                    <div className="w-px h-6 md:h-8 bg-gray-200"></div>
                                    <div>
                                        <p className="text-xl md:text-2xl font-black text-red-500">{stats.overdueLoans}</p>
                                        <p className="text-[8px] md:text-[9px] text-gray-400 font-bold">{t('overdue')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                            {/* Monthly Trend Chart */}
                            <div className="md:col-span-2 bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-4 md:mb-6">
                                    <div className="flex items-center gap-2">
                                        <Activity size={16} className="text-[#D4AF37]" />
                                        <h3 className="text-xs md:text-sm font-black text-gray-800 uppercase tracking-widest">{t('monthlyTrend')}</h3>
                                    </div>
                                    <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase">{t('last6Months')}</span>
                                </div>
                                <div className="flex items-end justify-between gap-1 md:gap-2 h-32 md:h-40">
                                    {stats.monthlyData.map((data, idx) => (
                                        <div
                                            key={idx}
                                            className="flex-1 flex flex-col items-center gap-1 md:gap-2 cursor-pointer"
                                            onClick={() => openDetailModal('monthlyLoans', data)}
                                        >
                                            <div className="text-[8px] md:text-[10px] font-bold text-gray-500 mb-1">
                                                {data.amount > 0 ? formatCurrency(data.amount) : ''}
                                            </div>
                                            <div
                                                className="w-full bg-gradient-to-t from-[#D4AF37] to-[#F4D03F] rounded-t-lg transition-all hover:from-[#B8860B] hover:to-[#D4AF37]"
                                                style={{ height: `${Math.max((data.amount / stats.maxMonthly) * 100, 5)}%` }}
                                            ></div>
                                            <span className="text-[9px] md:text-[10px] font-black text-gray-400">{data.month}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Product Distribution */}
                            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2 mb-4 md:mb-6">
                                    <PieChart size={16} className="text-[#D4AF37]" />
                                    <h3 className="text-xs md:text-sm font-black text-gray-800 uppercase tracking-widest">{t('byProduct')}</h3>
                                </div>
                                <div className="space-y-2 md:space-y-3">
                                    {Object.entries(stats.productCounts).length === 0 ? (
                                        <p className="text-sm text-gray-400 text-center py-4">{t('noLoansYet')}</p>
                                    ) : (
                                        Object.entries(stats.productCounts).slice(0, 5).map(([product, count], idx) => {
                                            const colors = ['#D4AF37', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
                                            const total = Object.values(stats.productCounts).reduce((a, b) => a + b, 0);
                                            const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                                            return (
                                                <div key={product}>
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="font-bold text-gray-600">{product}</span>
                                                        <span className="font-black text-gray-800">{count}</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all"
                                                            style={{ width: `${percent}%`, backgroundColor: colors[idx % colors.length] }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recent Loans */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-[#D4AF37]" />
                                    <h3 className="text-xs md:text-sm font-black text-gray-800 uppercase tracking-widest">{t('recentLoans')}</h3>
                                </div>
                                <Link href="/gold-loan" className="text-[10px] md:text-xs font-black text-[#D4AF37] uppercase tracking-wider flex items-center gap-1 hover:underline">
                                    {t('viewAll')} <ChevronRight size={14} />
                                </Link>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {stats.recentLoans.map(loan => (
                                    <div
                                        key={loan.id}
                                        className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between hover:bg-gray-50/50 transition-all cursor-pointer"
                                        onClick={() => openDetailModal('loanDetail', loan)}
                                    >
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <div className="w-8 h-8 md:w-10 md:h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center">
                                                <span className="text-[#D4AF37] font-black text-xs md:text-sm">{loan.customerName.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-800 uppercase text-xs md:text-sm">{loan.customerName}</p>
                                                <p className="text-[9px] md:text-[10px] text-gray-400 font-bold">{loan.billNumber} • {loan.productType}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-[#D4AF37] text-sm md:text-base">₹{loan.loanAmount.toLocaleString()}</p>
                                            <p className="text-[9px] md:text-[10px] text-gray-400 font-bold">
                                                {new Date(loan.loanDate).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', { day: '2-digit', month: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {stats.recentLoans.length === 0 && (
                                    <div className="px-6 py-12 text-center">
                                        <p className="text-gray-400 font-bold text-sm">{t('noLoansYet')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                <p className="mt-8 md:mt-12 text-center text-[9px] text-gray-300 font-black uppercase tracking-[0.3em]">
                    {t('sriVasaviJewellery')}
                </p>
            </div>

            {/* Detail Modal */}
            {detailModal && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setDetailModal(null)}>
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-4 bg-[#333333] text-white flex items-center justify-between">
                            <h3 className="font-black uppercase tracking-widest text-sm">
                                {detailModal.type === 'loansGiven' && t('loansGiven')}
                                {detailModal.type === 'interest' && t('interestEarned')}
                                {detailModal.type === 'outstanding' && t('outstanding')}
                                {detailModal.type === 'alerts' && t('alerts')}
                                {detailModal.type === 'monthlyLoans' && `${detailModal.data.month} - ${t('loansGiven')}`}
                                {detailModal.type === 'loanDetail' && t('loanDetails')}
                            </h3>
                            <button onClick={() => setDetailModal(null)} className="p-2 hover:bg-white/10 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[60vh]">
                            {(detailModal.type === 'loansGiven' || detailModal.type === 'interest' || detailModal.type === 'outstanding' || detailModal.type === 'monthlyLoans') && (
                                <div className="space-y-3">
                                    {(detailModal.type === 'monthlyLoans' ? detailModal.data.loans : detailModal.data).map((loan: Loan) => (
                                        <div key={loan.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                            <div>
                                                <p className="font-black text-gray-800 uppercase text-sm">{loan.customerName}</p>
                                                <p className="text-[10px] text-gray-400 font-bold">{loan.billNumber} • {loan.productType}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-[#D4AF37]">₹{loan.loanAmount.toLocaleString()}</p>
                                                <p className="text-[10px] text-gray-400 font-bold">
                                                    {new Date(loan.loanDate).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {(detailModal.type === 'monthlyLoans' ? detailModal.data.loans : detailModal.data).length === 0 && (
                                        <p className="text-center text-gray-400 py-8">{t('noLoansYet')}</p>
                                    )}
                                </div>
                            )}
                            {detailModal.type === 'alerts' && (
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-xs font-black text-orange-500 uppercase tracking-widest mb-3">{t('dueSoon')} ({detailModal.data.upcoming.length})</h4>
                                        <div className="space-y-2">
                                            {detailModal.data.upcoming.map((loan: Loan) => (
                                                <div key={loan.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100">
                                                    <div>
                                                        <p className="font-black text-gray-800 uppercase text-sm">{loan.customerName}</p>
                                                        <p className="text-[10px] text-gray-500 font-bold">{loan.billNumber}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-orange-500">₹{loan.loanAmount.toLocaleString()}</p>
                                                        <p className="text-[10px] text-orange-400 font-bold">
                                                            Due: {new Date(loan.returnDate).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', { day: '2-digit', month: 'short' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                            {detailModal.data.upcoming.length === 0 && <p className="text-sm text-gray-400 text-center py-4">None</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-red-500 uppercase tracking-widest mb-3">{t('overdue')} ({detailModal.data.overdue.length})</h4>
                                        <div className="space-y-2">
                                            {detailModal.data.overdue.map((loan: Loan) => (
                                                <div key={loan.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                                                    <div>
                                                        <p className="font-black text-gray-800 uppercase text-sm">{loan.customerName}</p>
                                                        <p className="text-[10px] text-gray-500 font-bold">{loan.billNumber}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-black text-red-500">₹{loan.loanAmount.toLocaleString()}</p>
                                                        <p className="text-[10px] text-red-400 font-bold">
                                                            Was due: {new Date(loan.returnDate).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', { day: '2-digit', month: 'short' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                            {detailModal.data.overdue.length === 0 && <p className="text-sm text-gray-400 text-center py-4">None</p>}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {detailModal.type === 'loanDetail' && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">{t('customer')}</p>
                                            <p className="font-black text-gray-800 uppercase">{detailModal.data.customerName}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">{t('product')}</p>
                                            <p className="font-black text-gray-800">{detailModal.data.productType}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">{t('amount')}</p>
                                            <p className="font-black text-[#D4AF37] text-lg">₹{detailModal.data.loanAmount.toLocaleString()}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-xl">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">{t('date')}</p>
                                            <p className="font-black text-gray-800">
                                                {new Date(detailModal.data.loanDate).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-[#D4AF37]/10 rounded-xl">
                                        <p className="text-[10px] text-[#B8860B] font-bold uppercase mb-1">Bill Number</p>
                                        <p className="font-black text-[#B8860B] text-lg">{detailModal.data.billNumber}</p>
                                    </div>
                                    <Link
                                        href="/gold-loan"
                                        className="block w-full bg-[#D4AF37] text-white py-3 rounded-xl font-black uppercase tracking-widest text-center text-sm hover:bg-[#B8860B] transition-all"
                                    >
                                        {t('viewAll')}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
