'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Check, X } from 'lucide-react';

interface CustomDatePickerProps {
    selected: Date | null;
    onChange: (date: Date) => void;
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const START_YEAR = 2000;
const YEARS = Array.from({ length: 51 }, (_, i) => START_YEAR + i);

export default function CustomDatePicker({ selected, onChange }: CustomDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [wheelDate, setWheelDate] = useState<Date>(selected || new Date());
    const monthRef = useRef<HTMLDivElement>(null);
    const dayRef = useRef<HTMLDivElement>(null);
    const yearRef = useRef<HTMLDivElement>(null);

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    useEffect(() => {
        if (isOpen) {
            scrollToItem(monthRef.current, wheelDate.getMonth());
            scrollToItem(dayRef.current, wheelDate.getDate() - 1);
            scrollToItem(yearRef.current, wheelDate.getFullYear() - START_YEAR);
        }
    }, [isOpen]);

    const scrollToItem = (container: HTMLDivElement | null, index: number) => {
        if (container) {
            container.scrollTo({
                top: index * 36,
                behavior: 'smooth'
            });
        }
    };

    const handleScroll = (type: 'month' | 'day' | 'year') => (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const itemHeight = 36;
        const index = Math.round((container.scrollTop) / itemHeight);

        const currentMonth = wheelDate.getMonth();
        const currentYear = wheelDate.getFullYear();
        const currentDay = wheelDate.getDate();

        if (type === 'month' && index >= 0 && index < 12 && index !== currentMonth) {
            const maxDays = getDaysInMonth(index, currentYear);
            const d = new Date(currentYear, index, Math.min(currentDay, maxDays));
            setWheelDate(d);
            onChange(d);
        } else if (type === 'day') {
            const maxDays = getDaysInMonth(currentMonth, currentYear);
            if (index >= 0 && index < maxDays && (index + 1) !== currentDay) {
                const d = new Date(currentYear, currentMonth, index + 1);
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
        setIsOpen(false);
    };

    const displayDate = selected
        ? `${String(selected.getDate()).padStart(2, '0')}-${String(selected.getMonth() + 1).padStart(2, '0')}-${selected.getFullYear()}`
        : '';

    const daysInMonth = getDaysInMonth(wheelDate.getMonth(), wheelDate.getFullYear());
    const DAYS_ARRAY = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
        <div className="relative w-full">
            <style jsx global>{`
                .scrolling-picker {
                    position: absolute;
                    top: 100%;
                    right: 0;
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
                @keyframes slideUp {
                    from { transform: translateY(5px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @media (min-width: 640px) {
                    .scrolling-picker {
                        left: 50%;
                        right: auto;
                        transform: translateX(-50%);
                    }
                    @keyframes slideUp {
                        from { transform: translateY(5px) translateX(-50%); opacity: 0; }
                        to { transform: translateY(0) translateX(-50%); opacity: 1; }
                    }
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
            `}</style>

            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:border-[#D4AF37] transition-all group"
            >
                <Calendar size={16} className="text-gray-400 group-hover:text-[#D4AF37] shrink-0" />
                <span className="font-bold text-gray-700 text-sm whitespace-nowrap">
                    {displayDate || 'Select Date'}
                </span>
            </div>

            {isOpen && (
                <div className="scrolling-picker">
                    <div className="wheel-header">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Select Date</span>
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
                            {MONTHS.map((m, i) => (
                                <div key={m} className={`wheel-item ${wheelDate.getMonth() === i ? 'active' : ''}`} onClick={() => scrollToItem(monthRef.current, i)}>
                                    {m}
                                </div>
                            ))}
                        </div>

                        {/* Day */}
                        <div className="wheel-col" ref={dayRef} onScroll={handleScroll('day')}>
                            {DAYS_ARRAY.map((d, i) => (
                                <div key={d} className={`wheel-item ${wheelDate.getDate() === d ? 'active' : ''}`} onClick={() => scrollToItem(dayRef.current, i)}>
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Year */}
                        <div className="wheel-col" ref={yearRef} onScroll={handleScroll('year')}>
                            {YEARS.map((y, i) => (
                                <div key={y} className={`wheel-item ${wheelDate.getFullYear() === y ? 'active' : ''}`} onClick={() => scrollToItem(yearRef.current, i)}>
                                    {y}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-3 bg-gray-50 flex gap-2">
                        <button
                            onClick={handleConfirm}
                            className="flex-1 bg-[#D4AF37] text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-[#b8962e] transition-all flex items-center justify-center gap-2"
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
