import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Languages } from 'lucide-react';

export default function Header({ rates }: { rates?: { k22: number; k24: number } }) {
    const { language, setLanguage, t } = useLanguage();

    return (
        <header className="py-2.5 md:py-4 bg-white border-b border-gray-100 shadow-sm fixed top-0 left-0 right-0 z-[55]">
            <div className="w-full px-4 md:px-8 flex flex-col">
                <div className="flex justify-between items-start w-full">
                    <div className="flex items-center gap-2 md:gap-4">
                        <Link href="/" className="md:hidden">
                            <img
                                src="/svj-1.png"
                                alt="SVJ Logo"
                                className="h-[46px] w-[46px] md:h-16 md:w-16 object-cover rounded-xl shadow-sm border border-gray-100 mt-1"
                            />
                        </Link>
                        <div className="flex flex-col gap-1 md:gap-2">
                            <Link href="/">
                                <h1 className="text-lg md:text-3xl font-serif-gold cursor-pointer transition-all hover:opacity-80 tracking-tight leading-none">
                                    {t('sriVasaviJewellery')}
                                </h1>
                            </Link>

                            {/* Rates integrated below name */}
                            <div className="flex items-center gap-2 md:gap-4 mt-1">
                                {rates ? (
                                    <>
                                        <div className="flex items-center gap-1.5 md:gap-2 bg-gray-50/50 px-2 py-0.5 md:px-3 md:py-1 rounded-full border border-gray-100/50 transition-all hover:bg-white hover:border-[#D4AF37]/20">
                                            <span className="relative flex h-1.5 w-1.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                                            </span>
                                            <p className="text-[11px] md:text-[13px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                                22KT: <span className="text-[#D4AF37] font-black ml-0.5">₹{rates.k22.toLocaleString()}</span>
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 md:gap-2 bg-gray-50/50 px-2 py-0.5 md:px-3 md:py-1 rounded-full border border-gray-100/50 transition-all hover:bg-white hover:border-[#D4AF37]/20">
                                            <p className="text-[11px] md:text-[13px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                                                24KT: <span className="text-[#D4AF37] font-black ml-0.5">₹{rates.k24.toLocaleString()}</span>
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2 py-1">
                                        <span className="relative flex h-1.5 w-1.5">
                                            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                                        </span>
                                        <p className="text-[8px] md:text-[9px] font-black text-gray-300 uppercase tracking-widest animate-pulse leading-none">
                                            {t('syncing') || 'Syncing...'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
                        className="flex items-center gap-1.5 px-2 py-1 md:px-2.5 md:py-1.5 bg-gray-50 border border-gray-100 rounded-full hover:bg-white hover:border-[#D4AF37]/30 transition-all group shrink-0 mt-1"
                    >
                        <div className="flex items-center justify-center w-4 h-4 md:w-5 md:h-5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-white transition-all">
                            <Languages size={8} className="md:hidden" />
                            <Languages size={10} className="hidden md:block" />
                        </div>
                        <span className={`font-black uppercase text-gray-600 group-hover:text-gray-900 transition-colors ${language === 'en' ? 'text-sm md:text-base' : 'text-[11px] md:text-sm'}`}>
                            {language === 'en' ? 'த' : 'E'}
                        </span>
                    </button>
                </div>
            </div>
        </header>
    );
}
