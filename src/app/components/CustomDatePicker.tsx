'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar as CalendarIcon, X, Check } from 'lucide-react';

interface CustomDatePickerProps {
    selected: Date | null;
    onChange: (date: Date | null) => void;
    placeholderText?: string;
}

const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const START_YEAR = 1900;
const END_YEAR = 2100;
const YEARS = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, i) => START_YEAR + i);

export default function CustomDatePicker({ selected, onChange, placeholderText }: CustomDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Internal state for the wheels
    const [wheelDate, setWheelDate] = useState(selected || new Date());

    const monthRef = useRef<HTMLDivElement>(null);
    const dayRef = useRef<HTMLDivElement>(null);
    const yearRef = useRef<HTMLDivElement>(null);

    const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();

    // Helper to scroll a container to a specific index
    const scrollToItem = useCallback((container: HTMLDivElement | null, index: number, behavior: ScrollBehavior = 'smooth') => {
        if (container && container.children[index]) {
            const item = container.children[index] as HTMLElement;
            container.scrollTo({
                top: item.offsetTop - (container.clientHeight / 2) + (item.clientHeight / 2),
                behavior
            });
        }
    }, []);

    // Effect to handle initialization and selection updates
    useEffect(() => {
        if (isOpen) {
            const date = selected || new Date();
            setWheelDate(date);

            // Short delay to ensure DOM is ready for scrolling
            const timer = setTimeout(() => {
                scrollToItem(monthRef.current, date.getMonth(), 'auto');
                scrollToItem(dayRef.current, date.getDate() - 1, 'auto');
                scrollToItem(yearRef.current, date.getFullYear() - START_YEAR, 'auto');
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isOpen, selected, scrollToItem]);

    const handleScroll = (type: 'month' | 'day' | 'year') => (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget;
        const itemHeight = 36; // Matching .wheel-item height
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
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 100;
                    margin-top: 8px;
                    background: white;
                    border-radius: 16px;
                    width: 240px;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0,0,0,0.05);
                    border: 1px solid #f3f4f6;
                    overflow: hidden;
                    animation: slideUp 0.2s ease-out;
                }
                @keyframes slideUp {
                    from { transform: translateY(10px) translateX(-50%); opacity: 0; }
                    to { transform: translateY(0) translateX(-50%); opacity: 1; }
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
                    padding: 42px 0; /* (120 - 36) / 2 */
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
                    background: #333;
                    color: white;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
            `}</style>

            <div
                className="relative flex items-center cursor-pointer group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <CalendarIcon size={16} className={`absolute left-0 transition-colors ${isOpen ? 'text-[#D4AF37]' : 'text-gray-300 group-hover:text-[#D4AF37]'}`} />
                <input
                    type="text"
                    readOnly
                    value={displayDate}
                    placeholder={placeholderText || "DD-MM-YYYY"}
                    className="w-full pl-6 py-2 bg-transparent border-b-2 border-gray-100 group-hover:border-[#D4AF37] outline-none transition-all font-bold text-base text-gray-800 cursor-pointer"
                />
            </div>

            {isOpen && (
                <div className="scrolling-picker">
                    <div className="wheel-header">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Select Date</span>
                        <div className="flex gap-2">
                            <button onClick={() => setIsOpen(false)} className="hover:text-red-400">
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
