'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Check, X } from 'lucide-react';

interface CustomDatePickerProps {
    selected: Date | null;
    onChange: (date: Date) => void;
    align?: 'left' | 'right';
    className?: string;
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const START_YEAR = 2000;
const YEARS = Array.from({ length: 51 }, (_, i) => START_YEAR + i);
const MONTHS_RECURRING = [...MONTHS, ...MONTHS, ...MONTHS];

export default function CustomDatePicker({ selected, onChange, align = 'left', className = '' }: CustomDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [wheelDate, setWheelDate] = useState<Date>(selected || new Date());
    const monthRef = useRef<HTMLDivElement>(null);
    const dayRef = useRef<HTMLDivElement>(null);
    const yearRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isHoveringRef = useRef(false);
    const isProgrammaticScroll = useRef(false);

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
            // Initialize at middle set for looping
            scrollToItem(monthRef.current, wheelDate.getMonth(), 'auto', 12);
            scrollToItem(dayRef.current, wheelDate.getDate() - 1, 'auto', daysInMonth);
            scrollToItem(yearRef.current, wheelDate.getFullYear() - START_YEAR, 'auto');
            resetAutoCloseTimer();
        }
    }, [isOpen]);

    const handleScroll = (type: 'month' | 'day' | 'year') => (e: React.UIEvent<HTMLDivElement>) => {
        if (isProgrammaticScroll.current) return;
        resetAutoCloseTimer();
        const container = e.currentTarget;
        const itemHeight = 36;
        const index = Math.round((container.scrollTop) / itemHeight);

        const currentMonth = wheelDate.getMonth();
        const currentYear = wheelDate.getFullYear();
        const currentDay = wheelDate.getDate();

        if (type === 'month') {
            const normalizedIndex = index % 12;
            // Looping jump
            if (index < 6) {
                scrollToItem(container, normalizedIndex + 12, 'auto');
            } else if (index > 24) {
                scrollToItem(container, normalizedIndex + 12, 'auto');
            }

            if (normalizedIndex !== currentMonth) {
                const maxDays = getDaysInMonth(normalizedIndex, currentYear);
                const d = new Date(currentYear, normalizedIndex, Math.min(currentDay, maxDays));
                setWheelDate(d);
                onChange(d);
            }
        } else if (type === 'day') {
            const normalizedIndex = index % daysInMonth;
            // Looping jump
            if (index < daysInMonth / 2) {
                scrollToItem(container, normalizedIndex + daysInMonth, 'auto');
            } else if (index > daysInMonth * 2) {
                scrollToItem(container, normalizedIndex + daysInMonth, 'auto');
            }

            if ((normalizedIndex + 1) !== currentDay) {
                const d = new Date(currentYear, currentMonth, normalizedIndex + 1);
                setWheelDate(d);
                onChange(d);
            }
        } else if (type === 'year') {
            const year = START_YEAR + index;
            if (index >= 0 && index < YEARS.length && year !== currentYear) {
                const maxDays = getDaysInMonth(currentMonth, year);
                const d = new Date(year, currentMonth, Math.min(currentDay, maxDays));
                setWheelDate(d);
                onChange(d);
            }
        }
    };

    const handleConfirm = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
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
        <div className={`relative w-full ${className}`}>
            <style jsx global>{`
                .scrolling-picker {
                    position: absolute;
                    top: 100%;
                    ${align === 'left' ? 'left: 0;' : 'right: 0;'}
                    z-index: 9999;
                    margin-top: 8px;
                    background: white;
                    border-radius: 16px;
                    width: 240px;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0,0,0,0.05);
                    border: 1px solid #f3f4f6;
                    overflow: hidden;
                    animation: slideUp 0.15s ease-out;
                }
                @media (max-width: 640px) {
                    .scrolling-picker {
                        ${align === 'left' ? 'transform: translateX(-40px);' : ''}
                    }
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
                className="relative h-[40px] flex items-center bg-transparent border-b-2 border-gray-100 transition-all group w-full overflow-hidden date-input-field"
            >
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-[#D4AF37] transition-colors">
                    <Calendar size={14} />
                </span>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    placeholder="DD-MM-YYYY"
                    className="w-full pl-8 pr-4 py-2 bg-transparent outline-none font-bold text-gray-700 text-lg leading-none"
                />
            </div>

            {isOpen && (
                <div
                    className="scrolling-picker"
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
                </div>
            )}
        </div>
    );
}
