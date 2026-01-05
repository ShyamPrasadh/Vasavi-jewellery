import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Languages } from 'lucide-react';

export default function Header({ rates }: { rates?: { k22: number; k24: number } }) {
    const { language, setLanguage, t } = useLanguage();

    return (
        <header className="py-4 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
            <div className="w-full px-4 md:px-8 flex flex-col gap-4">
                {/* Top Row: Logo & Toggle */}
                <div className="flex justify-between items-center w-full">
                    <Link href="/">
                        <div className="group flex items-center gap-2 md:gap-3">
                            <img
                                src="/logo.jpg"
                                alt="SVJ Logo"
                                className="h-8 w-8 md:h-12 md:w-12 object-cover rounded-xl shadow-sm border border-gray-100"
                            />
                            <h1 className="text-lg md:text-2xl font-serif-gold cursor-pointer transition-all group-hover:opacity-80 tracking-tight leading-tight">
                                {t('sriVasaviJewellery')}
                            </h1>
                        </div>
                    </Link>

                    {/* Simplified Language Toggle */}
                    <button
                        onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
                        className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-gray-50 border border-gray-100 rounded-full hover:bg-white hover:border-[#D4AF37]/30 transition-all group shrink-0"
                    >
                        <div className="flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-white transition-all">
                            <Languages size={10} className="md:hidden" />
                            <Languages size={12} className="hidden md:block" />
                        </div>
                        <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-gray-600 group-hover:text-gray-900 transition-colors">
                            {language === 'en' ? 'தமிழ்' : 'English'}
                        </span>
                    </button>
                </div>

                {/* Bottom Row: Live Rates */}
                <div className="flex items-center justify-center md:justify-end gap-3 md:gap-6 pt-3 border-t border-gray-50/50 md:border-t-0 md:pt-0">
                    {rates ? (
                        <>
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-gray-100 shadow-sm">
                                <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-green-500"></span>
                                </span>
                                <p className="text-[9px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    22KT: <span className="text-[#D4AF37] font-black ml-1">₹{rates.k22.toLocaleString()}</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-gray-100 shadow-sm">
                                <p className="text-[9px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">
                                    24KT: <span className="text-[#D4AF37] font-black ml-1">₹{rates.k24.toLocaleString()}</span>
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest animate-pulse">
                                {t('syncing') || 'Syncing...'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
