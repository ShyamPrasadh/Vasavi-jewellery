import Link from 'next/link';

export default function Header({ rates }: { rates?: { k22: number; k24: number } }) {
    return (
        <header className="py-4 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
            <div className="w-full px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <Link href="/">
                    <div className="group flex items-center gap-3">
                        <img
                            src="/logo.jpg"
                            alt="SVJ Logo"
                            className="h-10 w-10 md:h-12 md:w-12 object-cover rounded-xl shadow-sm border border-gray-100"
                        />
                        <h1 className="text-xl md:text-2xl font-serif-gold cursor-pointer transition-all group-hover:opacity-80 tracking-tight">
                            Sri Vasavi Jewellery
                        </h1>
                    </div>
                </Link>

                {rates && (
                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                22KT: <span className="text-[#D4AF37] font-black ml-1 text-sm">₹{rates.k22.toLocaleString()}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                24KT: <span className="text-[#D4AF37] font-black ml-1 text-sm">₹{rates.k24.toLocaleString()}</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
