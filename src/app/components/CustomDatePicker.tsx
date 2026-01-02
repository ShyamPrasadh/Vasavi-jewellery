'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';

interface CustomDatePickerProps {
    selected: Date | null;
    onChange: (date: Date | null) => void;
    placeholderText?: string;
}

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const YEARS = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - 25 + i); // 25 years back, 25 years forward

export default function CustomDatePicker({ selected, onChange, placeholderText }: CustomDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Internal state for the wheel positions
    const [wheelMonth, setWheelMonth] = useState(selected ? selected.getMonth() : new Date().getMonth());
    const [wheelYear, setWheelYear] = useState(selected ? selected.getFullYear() : new Date().getFullYear());
    const [wheelDay, setWheelDay] = useState(selected ? selected.getDate() : new Date().getDate());

    // Refs for scrolling
    const monthRef = useRef<HTMLDivElement>(null);
    const dayRef = useRef<HTMLDivElement>(null);
    const yearRef = useRef<HTMLDivElement>(null);

    // Calculate days in selected month/year
    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const daysInMonth = getDaysInMonth(wheelMonth, wheelYear);
    const DAYS = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Ensure selected day is valid when month changes (e.g. 31st Jan -> Feb)
    useEffect(() => {
        if (wheelDay > daysInMonth) {
            setWheelDay(daysInMonth);
        }
    }, [wheelMonth, wheelYear, daysInMonth, wheelDay]);

    // Scroll to selected items when opening
    useEffect(() => {
        if (isOpen) {
            // Reset wheel state to currently selected date or today
            const dateToShow = selected || new Date();
            setWheelMonth(dateToShow.getMonth());
            setWheelYear(dateToShow.getFullYear());
            setWheelDay(dateToShow.getDate());

            setTimeout(() => {
                scrollToItem(monthRef.current, dateToShow.getMonth());
                scrollToItem(yearRef.current, YEARS.indexOf(dateToShow.getFullYear()));
                scrollToItem(dayRef.current, dateToShow.getDate() - 1);
            }, 100);
        }
    }, [isOpen, selected]);

    const scrollToItem = (container: HTMLDivElement | null, index: number) => {
        if (container && index !== -1) {
            const item = container.children[index] as HTMLElement;
            if (item) {
                container.scrollTop = item.offsetTop - container.offsetHeight / 2 + item.offsetHeight / 2;
            }
        }
    };

    const handleConfirm = () => {
        const newDate = new Date(wheelYear, wheelMonth, wheelDay);
        onChange(newDate);
        setIsOpen(false);
    };

    // Format date for display
    const displayDate = selected
        ? `${String(selected.getDate()).padStart(2, '0')}-${String(selected.getMonth() + 1).padStart(2, '0')}-${selected.getFullYear()}`
        : '';

    return (
        <div className="relative w-full custom-datepicker-wrapper">
            <style jsx global>{`
                .wheel-popover {
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    margin-top: 12px;
                    z-index: 50;
                    width: 300px;
                    background: white;
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.05);
                    animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .wheel-overlay-fixed {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    z-index: 40;
                    background: transparent;
                }
                @keyframes popIn {
                    from { transform: translateX(-50%) scale(0.95); opacity: 0; }
                    to { transform: translateX(-50%) scale(1); opacity: 1; }
                }
                .wheel-columns {
                    display: flex;
                    height: 200px;
                    position: relative;
                    background: white;
                }
                .wheel-column {
                    flex: 1;
                    height: 100%;
                    overflow-y: auto;
                    scroll-snap-type: y mandatory;
                    padding: 75px 0; /* Padding to center content */
                    position: relative;
                    z-index: 10;
                }
                .wheel-column::-webkit-scrollbar {
                    display: none;
                }
                .wheel-item {
                    height: 50px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    scroll-snap-align: center;
                    font-weight: 600;
                    color: #d1d5db; /* Gray-300 */
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 0.9rem;
                }
                .wheel-item.selected {
                    color: #1f2937; /* Gray-800 */
                    font-size: 1.1rem;
                    font-weight: 900;
                    transform: scale(1.1);
                }
                .wheel-highlight {
                    position: absolute;
                    top: 50%;
                    left: 0;
                    width: 100%;
                    height: 50px;
                    transform: translateY(-50%);
                    background: rgba(212, 175, 55, 0.1); /* Gold with opacity */
                    border-top: 1px solid rgba(212, 175, 55, 0.2);
                    border-bottom: 1px solid rgba(212, 175, 55, 0.2);
                    pointer-events: none;
                    z-index: 0;
                }
            `}</style>

            <div
                className="relative flex items-center cursor-pointer group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <CalendarIcon size={16} className="absolute left-0 text-gray-300 z-10 group-hover:text-[#D4AF37] transition-colors" />
                <input
                    type="text"
                    readOnly
                    value={displayDate}
                    placeholder={placeholderText || "DD-MM-YYYY"}
                    className="w-full pl-6 py-2 bg-transparent border-b-2 border-gray-100 group-hover:border-[#D4AF37] outline-none transition-all font-bold text-base text-gray-800 cursor-pointer pointer-events-none"
                />
            </div>

            {isOpen && (
                <>
                    <div className="wheel-overlay-fixed" onClick={() => setIsOpen(false)}></div>
                    <div className="wheel-popover" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 bg-[#333333] text-white">
                            <span className="font-black uppercase tracking-[0.2em] text-[10px] text-[#D4AF37]">Select Date</span>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Wheel Selector */}
                        <div className="wheel-columns">
                            <div className="wheel-highlight"></div>

                            {/* Month Column */}
                            <div className="wheel-column" ref={monthRef}>
                                {MONTHS.map((m, i) => (
                                    <div
                                        key={m}
                                        className={`wheel-item ${wheelMonth === i ? 'selected' : ''}`}
                                        onClick={() => {
                                            setWheelMonth(i);
                                            scrollToItem(monthRef.current, i);
                                        }}
                                    >
                                        {m.substring(0, 3)}
                                    </div>
                                ))}
                            </div>

                            {/* Day Column */}
                            <div className="wheel-column" ref={dayRef}>
                                {DAYS.map((d, i) => (
                                    <div
                                        key={d}
                                        className={`wheel-item ${wheelDay === d ? 'selected' : ''}`}
                                        onClick={() => {
                                            setWheelDay(d);
                                            scrollToItem(dayRef.current, i);
                                        }}
                                    >
                                        {d}
                                    </div>
                                ))}
                            </div>

                            {/* Year Column */}
                            <div className="wheel-column" ref={yearRef}>
                                {YEARS.map((y, i) => (
                                    <div
                                        key={y}
                                        className={`wheel-item ${wheelYear === y ? 'selected' : ''}`}
                                        onClick={() => {
                                            setWheelYear(y);
                                            scrollToItem(yearRef.current, i);
                                        }}
                                    >
                                        {y}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100 bg-gray-50">
                            <button
                                onClick={handleConfirm}
                                className="w-full bg-[#D4AF37] text-white font-black uppercase tracking-[0.2em] py-3 rounded-xl shadow-lg hover:bg-[#b8962e] transition-all active:scale-95 text-xs"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
