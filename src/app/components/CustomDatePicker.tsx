'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Check, X } from 'lucide-react';

interface CustomDatePickerProps {
    selected: Date | null;
    onChange: (date: Date) => void;
    align?: 'left' | 'right';
    className?: string;
    maxDate?: Date; // Maximum allowed date
    minDate?: Date; // Minimum allowed date
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const START_YEAR = 2000;
const YEARS = Array.from({ length: 51 }, (_, i) => START_YEAR + i);
const MONTHS_RECURRING = [...MONTHS, ...MONTHS, ...MONTHS];

export default function CustomDatePicker({ selected, onChange, align = 'left', className = '', maxDate, minDate }: CustomDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [wheelDate, setWheelDate] = useState<Date>(selected || new Date());
    const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
    const [isMounted, setIsMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const monthRef = useRef<HTMLDivElement>(null);
    const dayRef = useRef<HTMLDivElement>(null);
    const yearRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isHoveringRef = useRef(false);
    const isProgrammaticScroll = useRef(false);

    // Helper to clamp date within min/max
    const clampDate = (date: Date) => {
        let d = new Date(date);
        if (maxDate && d > maxDate) d = new Date(maxDate);
        if (minDate && d < minDate) d = new Date(minDate);
        return d;
    };

    // Portal mount check
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Calculate picker position when opening or when window moves
    const updatePosition = () => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setPickerPosition({
                top: rect.bottom + 8,
                left: align === 'right' ? rect.right - 240 : rect.left
            });
        }
    };

    useEffect(() => {
        if (isOpen) {
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [isOpen, align]);

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const daysInMonth = getDaysInMonth(wheelDate.getMonth(), wheelDate.getFullYear());
    const DAYS_ARRAY = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const DAYS_RECURRING = [...DAYS_ARRAY, ...DAYS_ARRAY, ...DAYS_ARRAY];

    const resetAutoCloseTimer = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (isHoveringRef.current) return;
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 4000);
    };

    const scrollToItem = (container: HTMLDivElement | null, index: number, behavior: ScrollBehavior = 'smooth', offsetSet: number = 0) => {
        if (container) {
            isProgrammaticScroll.current = true;
            container.scrollTo({
                top: (index + offsetSet) * 36,
                behavior
            });
            setTimeout(() => { isProgrammaticScroll.current = false; }, 200);
        }
    };

    useEffect(() => {
        if (isOpen) {
            const initial = clampDate(wheelDate);
            setWheelDate(initial);
            // Initialize at middle set for looping
            scrollToItem(monthRef.current, initial.getMonth(), 'auto', 12);
            scrollToItem(dayRef.current, initial.getDate() - 1, 'auto', daysInMonth);
            scrollToItem(yearRef.current, initial.getFullYear() - START_YEAR, 'auto');
            resetAutoCloseTimer();
        }
    }, [isOpen]);

    const handleScroll = (type: 'month' | 'day' | 'year') => (e: React.UIEvent<HTMLDivElement>) => {
        if (isProgrammaticScroll.current) return;
        resetAutoCloseTimer();
        const container = e.currentTarget;
        const itemHeight = 36;
        const index = Math.round((container.scrollTop) / itemHeight);

        let nMonth = wheelDate.getMonth();
        let nYear = wheelDate.getFullYear();
        let nDay = wheelDate.getDate();

        if (type === 'month') {
            nMonth = index % 12;
            if (index < 6 || index > 24) scrollToItem(container, nMonth + 12, 'auto');
        } else if (type === 'day') {
            nDay = (index % daysInMonth) + 1;
            if (index < daysInMonth / 2 || index > daysInMonth * 2) scrollToItem(container, nDay - 1 + daysInMonth, 'auto');
        } else if (type === 'year') {
            nYear = START_YEAR + index;
        }

        const maxD = getDaysInMonth(nMonth, nYear);
        const d = clampDate(new Date(nYear, nMonth, Math.min(nDay, maxD)));

        if (d.getTime() !== wheelDate.getTime()) {
            setWheelDate(d);
            onChange(d);

            // If clamped, visually sync columns
            if (d.getMonth() !== nMonth) scrollToItem(monthRef.current, d.getMonth(), 'smooth', 12);
            if (d.getDate() !== nDay) scrollToItem(dayRef.current, d.getDate() - 1, 'smooth', daysInMonth);
            if (d.getFullYear() !== nYear) scrollToItem(yearRef.current, d.getFullYear() - START_YEAR, 'smooth');
        }
    };

    const handleConfirm = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        const final = clampDate(wheelDate);
        onChange(final);
        setIsOpen(false);
    };

    const displayDate = selected
        ? `${String(selected.getDate()).padStart(2, '0')}-${String(selected.getMonth() + 1).padStart(2, '0')}-${selected.getFullYear()}`
        : '';

    const [inputValue, setInputValue] = useState(displayDate);

    useEffect(() => {
        setInputValue(displayDate);
    }, [displayDate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);

        // Try to parse DD-MM-YYYY
        const parts = val.split('-');
        if (parts.length === 3) {
            const d = parseInt(parts[0]);
            const m = parseInt(parts[1]) - 1;
            const y = parseInt(parts[2]);

            if (!isNaN(d) && !isNaN(m) && !isNaN(y) && y >= START_YEAR && y < START_YEAR + 51) {
                const newDate = new Date(y, m, d);
                if (newDate.getDate() === d && newDate.getMonth() === m && newDate.getFullYear() === y) {
                    onChange(newDate);
                    setWheelDate(newDate);
                }
            }
        }
    };

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
            <style jsx global>{`
                .scrolling-picker-portal {
                    position: fixed;
                    z-index: 99999;
                    background: white;
                    border-radius: 16px;
                    width: 240px;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0,0,0,0.05);
                    border: 1px solid #f3f4f6;
                    overflow: hidden;
                    animation: slideUp 0.15s ease-out;
                }
                @keyframes slideUp {
                    from { transform: translateY(5px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .wheel-container {
                    display: flex;
                    height: 120px;
                    position: relative;
                    padding: 0 12px;
                    background: linear-gradient(to bottom, #fff 0%, transparent 40%, transparent 60%, #fff 100%);
                }
                .wheel-col {
                    flex: 1;
                    height: 100%;
                    overflow-y: scroll;
                    scroll-snap-type: y mandatory;
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                    padding: 42px 0;
                }
                .wheel-col::-webkit-scrollbar {
                    display: none;
                }
                .wheel-item {
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    scroll-snap-align: center;
                    font-size: 14px;
                    font-weight: 600;
                    color: #9ca3af;
                    transition: all 0.2s;
                    cursor: pointer;
                }
                .wheel-item.active {
                    color: #111827;
                    font-weight: 800;
                    font-size: 16px;
                }
                .selection-bar {
                    position: absolute;
                    top: 50%;
                    left: 12px;
                    right: 12px;
                    height: 36px;
                    transform: translateY(-50%);
                    background: #f9f9f9;
                    border-radius: 8px;
                    z-index: -1;
                    border: 1px solid #f3f4f6;
                }
                .wheel-header {
                    padding: 12px 16px;
                    border-bottom: 1px solid #f3f4f6;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .date-input-field:focus-within {
                    border-color: #D4AF37;
                }
            `}</style>

            <div
                className="relative flex items-center bg-white border border-gray-200 rounded-xl transition-all group w-full overflow-hidden date-input-field focus-within:bg-white focus-within:border-[#D4AF37] focus-within:ring-2 focus-within:ring-[#D4AF37]/10"
            >
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#D4AF37] transition-colors cursor-pointer z-10"
                >
                    <Calendar size={18} />
                </div>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    placeholder="DD-MM-YYYY"
                    className="w-full pl-10 pr-4 py-3.5 bg-transparent outline-none font-bold text-gray-800 leading-none placeholder:text-gray-300"
                />
            </div>

            {isOpen && isMounted && createPortal(
                <div
                    className="scrolling-picker-portal"
                    style={{ top: pickerPosition.top, left: pickerPosition.left }}
                    onMouseEnter={() => {
                        isHoveringRef.current = true;
                        if (timeoutRef.current) clearTimeout(timeoutRef.current);
                    }}
                    onMouseLeave={() => {
                        isHoveringRef.current = false;
                        resetAutoCloseTimer();
                    }}
                >
                    <div className="wheel-header">
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#D4AF37]">Loan Date</span>
                        <div className="flex gap-2">
                            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="wheel-container">
                        <div className="selection-bar"></div>

                        {/* Month */}
                        <div className="wheel-col" ref={monthRef} onScroll={handleScroll('month')}>
                            {MONTHS_RECURRING.map((m, i) => (
                                <div key={`${m}-${i}`} className={`wheel-item ${wheelDate.getMonth() === (i % 12) ? 'active' : ''}`} onClick={() => { scrollToItem(monthRef.current, i % 12, 'smooth', 12); resetAutoCloseTimer(); }}>
                                    {m}
                                </div>
                            ))}
                        </div>

                        {/* Day */}
                        <div className="wheel-col" ref={dayRef} onScroll={handleScroll('day')}>
                            {DAYS_RECURRING.map((d, i) => (
                                <div key={`${d}-${i}`} className={`wheel-item ${wheelDate.getDate() === d && (i >= daysInMonth && i < daysInMonth * 2) ? 'active' : ''}`} onClick={() => { scrollToItem(dayRef.current, d - 1, 'smooth', daysInMonth); resetAutoCloseTimer(); }}>
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Year */}
                        <div className="wheel-col" ref={yearRef} onScroll={handleScroll('year')}>
                            {YEARS.map((y, i) => (
                                <div key={y} className={`wheel-item ${wheelDate.getFullYear() === y ? 'active' : ''}`} onClick={() => { scrollToItem(yearRef.current, i); resetAutoCloseTimer(); }}>
                                    {y}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-3 bg-gray-50 flex gap-2">
                        <button
                            onClick={handleConfirm}
                            className="flex-1 bg-[#D4AF37] text-white py-2 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-md hover:bg-[#b8962e] transition-all flex items-center justify-center gap-2"
                        >
                            <Check size={14} />
                            Set Date
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
