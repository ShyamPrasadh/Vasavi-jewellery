import Link from 'next/link';

export default function Header({ rates }: { rates?: { k22: number; k24: number } }) {
    return (
        <header className="py-10 text-center bg-[#630d0d] border-b border-[#D4AF37]/30 shadow-2xl relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-[#D4AF37] blur-3xl"></div>
                <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full bg-[#D4AF37] blur-3xl"></div>
            </div>

            <Link href="/">
                <div className="inline-block group relative z-10">
                    <h1 className="text-4xl md:text-6xl font-serif-gold cursor-pointer transition-all group-hover:scale-105 text-[#D4AF37] drop-shadow-lg tracking-tight">
                        Sri Vasavi Jewellery
                    </h1>
                    {rates && (
                        <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-10">
                            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-5 py-2 rounded-full border border-white/10 shadow-inner">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">
                                    Live 22KT: <span className="text-[#D4AF37] font-bold text-lg ml-1">₹{rates.k22.toLocaleString()}</span>
                                </p>
                            </div>
                            <div className="hidden md:block w-px h-6 bg-white/10"></div>
                            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-5 py-2 rounded-full border border-white/10 shadow-inner">
                                <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">
                                    Live 24KT: <span className="text-[#D4AF37] font-bold text-lg ml-1">₹{rates.k24.toLocaleString()}</span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </Link>
        </header>
    );
}
