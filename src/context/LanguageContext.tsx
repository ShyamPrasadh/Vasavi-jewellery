'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '../lib/translations';

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof typeof translations['en'], params?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en');
    const [mounted, setMounted] = useState(false);

    // Load language from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('language') as Language;
        if (saved && (saved === 'en' || saved === 'ta')) {
            setLanguage(saved);
        }
        setMounted(true);
    }, []);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
    };

    const t = (key: keyof typeof translations['en'], params?: Record<string, string | number>) => {
        let text = translations[language][key] || translations['en'][key] || key;

        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                text = text.replace(`{${k}}`, String(v));
            });
        }

        return text;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {mounted ? children : null}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
