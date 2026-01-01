import Link from 'next/link';

export default function Header({ rates }: { rates?: { k22: number; k24: number } }) {
    return (
        <header className="py-4 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
            <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <Link href="/">
                    <div className="group">
                        <h1 className="text-xl md:text-2xl font-serif-gold cursor-pointer transition-all group-hover:opacity-80 tracking-tight">
                            Sri Vasavi Jewellery
                        </h1>
                    </div>
                </Link>

                {rates && (
                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                            </span>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                                22KT: <span className="text-[#D4AF37] font-black ml-1">₹{rates.k22.toLocaleString()}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                                24KT: <span className="text-[#D4AF37] font-black ml-1">₹{rates.k24.toLocaleString()}</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
