'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useSidebar } from '@/context/SidebarContext';
import { User, Globe, Moon, Sun, ChevronRight, Settings } from 'lucide-react';

export default function Header({ rates }: { rates?: { k22: number; k24: number } }) {
    const { language, setLanguage, t } = useLanguage();
    const { isCollapsed } = useSidebar();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="h-[54px] md:h-[60px] bg-white shadow-[0_2px_15px_rgba(0,0,0,0.03)] fixed top-0 left-0 right-0 z-[55] flex items-center">
            <div className="w-full h-full flex items-center gap-3 md:gap-0">
                {/* Logo rail — same width & center line as sidebar icons */}
                <div
                    className={`
                        flex items-center shrink-0 h-full transition-all duration-300
                        pl-4
                        ${isCollapsed ? 'md:w-[64px] md:pl-0 md:justify-center' : 'md:w-[280px] md:pl-[28px]'}
                    `}
                >
                    <Link href="/" className="flex-shrink-0 leading-none">
                        {/* Serve original PNG (no next/image recompression) */}
                        <img
                            src="/svj-logo.png"
                            alt="SVJ Logo"
                            width={512}
                            height={512}
                            decoding="async"
                            className="h-[38px] w-[38px] object-contain"
                        />
                    </Link>
                </div>

                {/* Title + actions */}
                <div className="flex-1 min-w-0 h-full flex items-center justify-between gap-3 pr-4 md:pr-6">
                    <Link href="/" className="min-w-0">
                        <h1 className="text-lg md:text-[20px] font-serif-gold text-[#8B2332] cursor-pointer transition-all hover:opacity-80 tracking-tight leading-none truncate">
                            {t('sriVasaviJewellery')}
                        </h1>
                    </Link>

                {/* Right Section: Rates & Language Toggle */}
                <div className="flex items-center gap-4 md:gap-8">
                    {/* Rates Component inline */}
                    <div className="hidden md:flex items-center gap-6">
                        {rates ? (
                            <div className="flex items-center gap-5">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none pt-0.5">
                                        22K: <span className="text-[#D4AF37] ml-1">₹{rates.k22.toLocaleString('en-IN')}</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none pt-0.5">
                                        24K: <span className="text-[#D4AF37] ml-1">₹{rates.k24.toLocaleString('en-IN')}</span>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                </span>
                                <p className="text-[11px] font-black text-gray-300 uppercase tracking-widest animate-pulse leading-none pt-0.5">
                                    {t('syncing') || 'Syncing...'}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full transition-all group shrink-0 ${isMenuOpen ? 'bg-[#8B2332] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50 hover:text-[#8B2332]'}`}
                        >
                            <User size={18} className="md:hidden" />
                            <User size={22} className="hidden md:block" />
                        </button>

                        {/* Dropdown Menu */}
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-4 bg-gray-50/50 border-b border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('settings') || 'Settings'}</p>
                                </div>
                                <div className="p-2">
                                    {/* Language Toggle */}
                                    <button
                                        onClick={() => {
                                            setLanguage(language === 'en' ? 'ta' : 'en');
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg text-blue-500 group-hover:bg-blue-100 transition-colors">
                                                <Globe size={18} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[12px] font-black text-gray-800 uppercase tracking-wider">{language === 'en' ? 'தமிழ்' : 'English'}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('changeLanguage') || 'Change Language'}</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500" />
                                    </button>

                                    {/* Theme Placeholder */}
                                    <button
                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group opacity-60 cursor-not-allowed"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-50 rounded-lg text-amber-500 group-hover:bg-amber-100 transition-colors">
                                                <Sun size={18} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[12px] font-black text-gray-800 uppercase tracking-wider">{t('theme') || 'Light Mode'}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('comingSoon') || 'Coming Soon'}</p>
                                            </div>
                                        </div>
                                    </button>

                                    {/* More Settings Placeholder */}
                                    <button
                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group opacity-60 cursor-not-allowed"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-100 rounded-lg text-gray-500 group-hover:bg-gray-200 transition-colors">
                                                <Settings size={18} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[12px] font-black text-gray-800 uppercase tracking-wider">{t('otherSettings') || 'More Options'}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('futureOptions') || 'Future Updates'}</p>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                </div>
            </div>
        </header>
    );
}
