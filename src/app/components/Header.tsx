import Link from 'next/link';

export default function Header({ rates }: { rates?: { k22: number; k24: number } }) {
    return (
        <header className="py-8 text-center bg-white border-b border-gray-100">
            <Link href="/">
                <div className="inline-block group">

                    <h1 className="text-4xl md:text-5xl font-serif-gold cursor-pointer transition-transform group-hover:scale-105">
                        Sri Vasavi Jewellery
                    </h1>
                    {rates && (
                        <div className="mt-4 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                                    Live 22KT: <span className="text-[#D4AF37] font-bold text-lg">₹{rates.k22.toLocaleString()}</span>
                                </p>
                            </div>
                            <div className="hidden md:block w-px h-4 bg-gray-200"></div>
                            <div className="flex items-center gap-2">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                                    Live 24KT: <span className="text-[#B8860B] font-bold text-lg">₹{rates.k24.toLocaleString()}</span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </Link>
        </header>
    );
}
