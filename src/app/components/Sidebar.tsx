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
            name: t('dashboard'),
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
            name: t('goldLoan'),
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
                fixed left-0 z-40 bg-white border-r border-gray-50 shadow-[2px_0_15px_rgba(0,0,0,0.03)] transform transition-all duration-300 ease-in-out
                top-[54px] bottom-0 md:top-[60px]
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
                w-[280px] ${isCollapsed ? 'md:w-[64px]' : 'md:w-[280px]'}
            `}>
                <div className="h-full flex flex-col px-1.5 pb-1.5 md:px-2 md:pb-2 transition-all duration-300">
                    {/* Menu top matches page title: mt-0.5/mt-1 + pt-[10px] → 12px / 14px */}
                    <div className="space-y-1.5 md:space-y-2 flex-1 pt-[12px] md:pt-[14px]">
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
                                        group flex items-center transition-all duration-200 relative
                                        gap-4 px-4 py-3 rounded-xl
                                        ${isCollapsed
                                            ? 'md:justify-center md:px-0 md:py-0 md:w-[38px] md:h-[38px] md:mx-auto md:rounded-xl md:gap-0'
                                            : 'md:gap-4 md:px-4 md:mx-3 md:rounded-xl'
                                        }
                                        ${active
                                            ? 'bg-[#8B2332] text-white'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-[#8B2332]'
                                        }
                                    `}
                                    title={isCollapsed ? item.name : ''}
                                >
                                    <Icon
                                        size={isCollapsed ? 22 : 20}
                                        className="flex-shrink-0"
                                        strokeWidth={2}
                                    />
                                    <span className={`text-[12px] font-black uppercase tracking-normal whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'md:hidden' : 'md:w-auto md:opacity-100'}`}>
                                        {item.name}
                                    </span>

                                    {/* Tooltip for collapsed mode */}
                                    {isCollapsed && (
                                        <div className="absolute left-full ml-4 px-3 py-2 bg-[#333333] text-white text-[10px] font-bold uppercase tracking-normal rounded-lg opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-gray-700">
                                            {item.name}
                                            {/* Little arrow */}
                                            <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-[#333333]"></div>
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Footer / User Profile Mock */}
                    <div className="mt-auto pt-6 border-t border-gray-100">
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
