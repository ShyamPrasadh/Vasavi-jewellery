'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CustomDatePickerProps {
    selected: Date | null;
    onChange: (date: Date | null) => void;
    placeholderText?: string;
}

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CustomDatePicker({ selected, onChange, placeholderText }: CustomDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(selected || new Date());
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Calendar logic
    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const days = [];
    // Padding for the start of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
    }
    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
    }

    const changeMonth = (offset: number) => {
        const newDate = new Date(year, month + offset, 1);
        setViewDate(newDate);
    };

    const handleDateSelect = (date: Date) => {
        onChange(date);
        setIsOpen(false);
    };

    const isSelected = (date: Date) => {
        if (!selected) return false;
        return date.getDate() === selected.getDate() &&
            date.getMonth() === selected.getMonth() &&
            date.getFullYear() === selected.getFullYear();
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const formatDisplayDate = (date: Date | null) => {
        if (!date) return "";
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}-${m}-${y}`;
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            {/* Input Trigger */}
            <div
                className="relative flex items-center cursor-pointer group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <CalendarIcon size={16} className={`absolute left-0 transition-colors ${isOpen ? 'text-[#D4AF37]' : 'text-gray-300 group-hover:text-[#D4AF37]'}`} />
                <input
                    type="text"
                    readOnly
                    value={formatDisplayDate(selected)}
                    placeholder={placeholderText || "DD-MM-YYYY"}
                    className="w-full pl-6 py-2 bg-transparent border-b-2 border-gray-100 group-hover:border-[#D4AF37] outline-none transition-all font-bold text-base text-gray-800 cursor-pointer"
                />
            </div>

            {/* Calendar Popover */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-[100] w-[300px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-left">
                    {/* Header */}
                    <div className="bg-[#333333] p-4 flex items-center justify-between text-white">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">Select Date</span>
                            <span className="text-sm font-bold">{MONTHS[month]} {year}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={(e) => { e.stopPropagation(); changeMonth(-1); }}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); changeMonth(1); }}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Weekdays */}
                    <div className="grid grid-cols-7 gap-0 p-2 bg-gray-50/50">
                        {WEEKDAYS.map(day => (
                            <div key={day} className="text-center text-[10px] font-black text-gray-400 uppercase py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1 p-2">
                        {days.map((date, idx) => (
                            <div key={idx} className="aspect-square flex items-center justify-center">
                                {date ? (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDateSelect(date); }}
                                        className={`
                                            w-full h-full rounded-xl text-sm font-bold transition-all
                                            flex items-center justify-center
                                            ${isSelected(date)
                                                ? 'bg-[#D4AF37] text-white shadow-lg shadow-amber-200'
                                                : isToday(date)
                                                    ? 'text-[#D4AF37] bg-amber-50'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }
                                        `}
                                    >
                                        {date.getDate()}
                                    </button>
                                ) : (
                                    <div className="w-full h-full"></div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Footer - Quick Today shortcut */}
                    <div className="p-3 border-t border-gray-50 bg-gray-50/30 flex justify-center">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDateSelect(new Date()); }}
                            className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest hover:underline"
                        >
                            Select Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
