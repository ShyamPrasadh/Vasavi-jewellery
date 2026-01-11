'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Calculator, Percent, Coins, Menu, ChevronLeft, ChevronRight, LayoutDashboard } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useSidebar } from '@/context/SidebarContext';
import { useState } from 'react';

export default function Sidebar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentMode = searchParams.get('mode');
    const { t } = useLanguage();
    const { isCollapsed, toggleSidebar } = useSidebar();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isActive = (path: string, mode?: string) => {
        if (pathname !== path) return false;
        if (mode && currentMode !== mode) return false;
        if (!mode && currentMode) return false;
        return true;
    };

    const menuItems = [
        {
            name: 'Dashboard',
            path: '/dashboard',
            mode: null,
            icon: LayoutDashboard
        },
        {
            name: t('goldCalculator'),
            path: '/',
            mode: null,
            icon: Calculator
        },
        {
            name: t('pawnInterest'),
            path: '/pawn',
            mode: 'calculator',
            icon: Percent
        },
        {
            name: 'Gold Loan',
            path: '/gold-loan',
            mode: null,
            icon: Coins
        }
    ];

    return (
        <>
            {/* Mobile Menu Toggle */}
            {/* Mobile Menu Toggle */}
            <div className="md:hidden fixed bottom-6 left-4 z-[60]">
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-3 bg-white rounded-full shadow-xl border border-gray-100/50 text-[#D4AF37] hover:scale-110 active:scale-95 transition-all duration-300"
                >
                    <Menu size={24} strokeWidth={2.5} />
                </button>
            </div>

            {/* Mobile Backdrop */}
            {mobileMenuOpen && (
                <div
                    className="fixed top-[70px] left-0 right-0 bottom-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed left-0 z-40 bg-white border-r border-gray-100 shadow-xl shadow-gray-200/50 transform transition-all duration-300 ease-in-out
                top-[70px] bottom-0 md:top-[90px]
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
                w-[280px] ${isCollapsed ? 'md:w-[88px]' : 'md:w-[280px]'}
            `}>
                <div className="h-full flex flex-col p-4 transition-all duration-300">
                    {/* Menu Items - starts below header */}
                    <div className="space-y-2 flex-1 pt-4">
                        {/* Menu Items */}

                        {menuItems.map((item) => {
                            const active = isActive(item.path, item.mode || undefined);
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.mode ? `${item.path}?mode=${item.mode}` : item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`
                                        group flex items-center ${isCollapsed ? 'md:justify-center md:px-0' : 'md:gap-4 md:px-4'} gap-4 px-4 py-3 rounded-xl transition-all duration-200 relative
                                        ${active
                                            ? 'bg-[#8B2332] text-white shadow-md shadow-[#8B2332]/20'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                        }
                                    `}
                                    title={isCollapsed ? item.name : ''}
                                >
                                    <Icon
                                        size={20}
                                        className="flex-shrink-0"
                                        strokeWidth={active ? 2.5 : 2}
                                    />
                                    <span className={`text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'md:w-0 md:opacity-0 md:hidden' : 'md:w-auto md:opacity-100'}`}>
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Footer / User Profile Mock */}
                    <div className="mt-auto pt-6 border-t border-gray-100">
                        <div className={`flex items-center ${isCollapsed ? 'md:justify-center' : 'md:gap-3 md:px-2'} gap-3 px-2`}>
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
                                <Coins size={18} />
                            </div>
                            <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'md:w-0 md:opacity-0' : 'md:w-auto md:opacity-100'}`}>
                                <p className="text-xs font-bold text-gray-800 whitespace-nowrap">Dashboard</p>
                                <p className="text-[10px] text-gray-400 whitespace-nowrap">v1.2.0</p>
                            </div>
                        </div>

                        {/* Collapsible Toggle for Desktop */}
                        <button
                            onClick={toggleSidebar}
                            className="hidden md:flex items-center justify-center w-full mt-4 p-2 text-gray-400 hover:text-[#D4AF37] hover:bg-gray-50 rounded-xl transition-all"
                        >
                            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
