'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import { useGoldRates } from '@/hooks/useGoldRates';
import Link from 'next/link';
import {
    TrendingUp, TrendingDown, Wallet, Scale, Users, Calendar,
    ArrowRight, ChevronRight, IndianRupee, Clock, AlertCircle,
    BarChart3, PieChart, Activity
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

export default function DashboardPage() {
    const { rates } = useGoldRates();
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'year' | 'all'>('month');

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

        // Filter by period
        const filteredLoans = loans.filter(loan => {
            const loanDate = new Date(loan.loanDate);
            if (selectedPeriod === 'month') {
                return loanDate.getMonth() === thisMonth && loanDate.getFullYear() === thisYear;
            } else if (selectedPeriod === 'year') {
                return loanDate.getFullYear() === thisYear;
            }
            return true;
        });

        // Calculate total principal given
        let totalPrincipal = 0;
        let totalAdditional = 0;
        filteredLoans.forEach(loan => {
            totalPrincipal += loan.loanAmount;
            loan.additionalLoans?.forEach(add => {
                totalAdditional += add.amount;
            });
        });

        // Calculate interest earned (approximate)
        let totalInterestEarned = 0;
        const today = new Date();
        loans.forEach(loan => {
            const start = new Date(loan.loanDate);
            const months = Math.abs(today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
            totalInterestEarned += loan.loanAmount * (loan.interestRate / 100) * months;
            loan.additionalLoans?.forEach(add => {
                const addDate = new Date(add.date);
                const addMonths = Math.abs(today.getTime() - addDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
                totalInterestEarned += add.amount * (loan.interestRate / 100) * addMonths;
            });
        });

        // Total outstanding
        let totalOutstanding = 0;
        loans.forEach(loan => {
            totalOutstanding += loan.loanAmount;
            loan.additionalLoans?.forEach(add => {
                totalOutstanding += add.amount;
            });
        });

        // Upcoming returns (within 30 days)
        const upcomingReturns = loans.filter(loan => {
            if (!loan.returnDate) return false;
            const returnDate = new Date(loan.returnDate);
            const daysUntil = (returnDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
            return daysUntil >= 0 && daysUntil <= 30;
        });

        // Overdue loans
        const overdueLoans = loans.filter(loan => {
            if (!loan.returnDate) return false;
            const returnDate = new Date(loan.returnDate);
            return returnDate < today;
        });

        // Product distribution
        const productCounts: Record<string, number> = {};
        loans.forEach(loan => {
            productCounts[loan.productType] = (productCounts[loan.productType] || 0) + 1;
        });

        // Monthly trend (last 6 months)
        const monthlyData: { month: string; amount: number }[] = [];
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
                l.additionalLoans?.forEach(a => monthTotal += a.amount);
            });
            monthlyData.push({
                month: d.toLocaleDateString('en-IN', { month: 'short' }),
                amount: monthTotal
            });
        }
        const maxMonthly = Math.max(...monthlyData.map(m => m.amount), 1);

        return {
            totalLoans: filteredLoans.length,
            totalPrincipal: totalPrincipal + totalAdditional,
            totalInterestEarned: Math.round(totalInterestEarned),
            totalOutstanding,
            activeLoans: loans.length,
            upcomingReturns: upcomingReturns.length,
            overdueLoans: overdueLoans.length,
            productCounts,
            monthlyData,
            maxMonthly,
            recentLoans: [...loans].sort((a, b) => new Date(b.loanDate).getTime() - new Date(a.loanDate).getTime()).slice(0, 5)
        };
    }, [loans, selectedPeriod]);

    const formatCurrency = (num: number) => {
        if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
        if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
        if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
        return `₹${num.toLocaleString()}`;
    };

    return (
        <main className="min-h-screen bg-[#FDFCFB] pb-32 pt-[70px] md:pt-[80px]">
            <Header rates={rates || undefined} />

            <div className="max-w-7xl mx-auto px-4 md:px-6 mt-6 md:mt-8">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-gray-800 uppercase tracking-tight">
                            Dashboard
                        </h1>
                        <p className="text-[10px] md:text-xs font-bold text-[#D4AF37] uppercase tracking-[0.2em] mt-1">
                            Business Overview & Analytics
                        </p>
                    </div>

                    {/* Period Selector */}
                    <div className="flex gap-2 mt-4 md:mt-0 bg-gray-100 p-1 rounded-xl">
                        {(['month', 'year', 'all'] as const).map(period => (
                            <button
                                key={period}
                                onClick={() => setSelectedPeriod(period)}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${selectedPeriod === period
                                        ? 'bg-[#D4AF37] text-white shadow-md'
                                        : 'text-gray-500 hover:text-gray-800'
                                    }`}
                            >
                                {period === 'month' ? 'This Month' : period === 'year' ? 'This Year' : 'All Time'}
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
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {/* Total Loans Given */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-lg transition-all">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#D4AF37]/10 to-transparent rounded-bl-full"></div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-2 bg-[#D4AF37]/10 rounded-lg">
                                        <Wallet size={18} className="text-[#D4AF37]" />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loans Given</span>
                                </div>
                                <p className="text-2xl md:text-3xl font-black text-gray-800">{formatCurrency(stats.totalPrincipal)}</p>
                                <p className="text-[10px] text-gray-400 mt-1 font-bold">{stats.totalLoans} transactions</p>
                            </div>

                            {/* Interest Earned */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-lg transition-all">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-green-500/10 to-transparent rounded-bl-full"></div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-2 bg-green-500/10 rounded-lg">
                                        <TrendingUp size={18} className="text-green-500" />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Interest</span>
                                </div>
                                <p className="text-2xl md:text-3xl font-black text-green-600">{formatCurrency(stats.totalInterestEarned)}</p>
                                <p className="text-[10px] text-gray-400 mt-1 font-bold">Total earned to date</p>
                            </div>

                            {/* Outstanding */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-lg transition-all">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full"></div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg">
                                        <BarChart3 size={18} className="text-blue-500" />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Outstanding</span>
                                </div>
                                <p className="text-2xl md:text-3xl font-black text-blue-600">{formatCurrency(stats.totalOutstanding)}</p>
                                <p className="text-[10px] text-gray-400 mt-1 font-bold">{stats.activeLoans} active loans</p>
                            </div>

                            {/* Alerts */}
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-lg transition-all">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-red-500/10 to-transparent rounded-bl-full"></div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-2 bg-red-500/10 rounded-lg">
                                        <AlertCircle size={18} className="text-red-500" />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Alerts</span>
                                </div>
                                <div className="flex items-baseline gap-3">
                                    <div>
                                        <p className="text-2xl font-black text-orange-500">{stats.upcomingReturns}</p>
                                        <p className="text-[9px] text-gray-400 font-bold">Due Soon</p>
                                    </div>
                                    <div className="w-px h-8 bg-gray-200"></div>
                                    <div>
                                        <p className="text-2xl font-black text-red-500">{stats.overdueLoans}</p>
                                        <p className="text-[9px] text-gray-400 font-bold">Overdue</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Charts Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {/* Monthly Trend Chart */}
                            <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <Activity size={18} className="text-[#D4AF37]" />
                                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Monthly Trend</h3>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Last 6 Months</span>
                                </div>
                                <div className="flex items-end justify-between gap-2 h-40">
                                    {stats.monthlyData.map((data, idx) => (
                                        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                            <div
                                                className="w-full bg-gradient-to-t from-[#D4AF37] to-[#F4D03F] rounded-t-lg transition-all hover:from-[#B8860B] hover:to-[#D4AF37]"
                                                style={{ height: `${Math.max((data.amount / stats.maxMonthly) * 100, 5)}%` }}
                                            ></div>
                                            <span className="text-[10px] font-black text-gray-400">{data.month}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Product Distribution */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2 mb-6">
                                    <PieChart size={18} className="text-[#D4AF37]" />
                                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">By Product</h3>
                                </div>
                                <div className="space-y-3">
                                    {Object.entries(stats.productCounts).slice(0, 5).map(([product, count], idx) => {
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
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Recent Loans */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock size={18} className="text-[#D4AF37]" />
                                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Recent Loans</h3>
                                </div>
                                <Link href="/gold-loan" className="text-xs font-black text-[#D4AF37] uppercase tracking-wider flex items-center gap-1 hover:underline">
                                    View All <ChevronRight size={14} />
                                </Link>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {stats.recentLoans.map(loan => (
                                    <div key={loan.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-[#D4AF37]/10 rounded-xl flex items-center justify-center">
                                                <span className="text-[#D4AF37] font-black text-sm">{loan.customerName.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-800 uppercase text-sm">{loan.customerName}</p>
                                                <p className="text-[10px] text-gray-400 font-bold">{loan.billNumber} • {loan.productType}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-[#D4AF37]">₹{loan.loanAmount.toLocaleString()}</p>
                                            <p className="text-[10px] text-gray-400 font-bold">
                                                {new Date(loan.loanDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {stats.recentLoans.length === 0 && (
                                    <div className="px-6 py-12 text-center">
                                        <p className="text-gray-400 font-bold text-sm">No loans yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Link href="/gold-loan" className="bg-[#D4AF37] text-white rounded-2xl p-5 flex items-center gap-3 hover:bg-[#B8860B] transition-all shadow-lg shadow-amber-200/30">
                                <Wallet size={24} />
                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider">New Loan</p>
                                    <p className="text-[9px] opacity-80">Add entry</p>
                                </div>
                            </Link>
                            <Link href="/pawn?mode=calculator" className="bg-gray-800 text-white rounded-2xl p-5 flex items-center gap-3 hover:bg-gray-700 transition-all">
                                <IndianRupee size={24} />
                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider">Calculator</p>
                                    <p className="text-[9px] opacity-80">Interest calc</p>
                                </div>
                            </Link>
                            <Link href="/" className="bg-white border border-gray-200 text-gray-800 rounded-2xl p-5 flex items-center gap-3 hover:bg-gray-50 transition-all">
                                <Scale size={24} className="text-[#D4AF37]" />
                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider">Gold Calc</p>
                                    <p className="text-[9px] text-gray-400">Price check</p>
                                </div>
                            </Link>
                            <Link href="/table" className="bg-white border border-gray-200 text-gray-800 rounded-2xl p-5 flex items-center gap-3 hover:bg-gray-50 transition-all">
                                <BarChart3 size={24} className="text-blue-500" />
                                <div>
                                    <p className="text-xs font-black uppercase tracking-wider">Reference</p>
                                    <p className="text-[9px] text-gray-400">Rate table</p>
                                </div>
                            </Link>
                        </div>
                    </>
                )}

                <p className="mt-12 text-center text-[9px] text-gray-300 font-black uppercase tracking-[0.3em]">
                    Sri Vasavi Jewellery Dashboard
                </p>
            </div>
        </main>
    );
}
