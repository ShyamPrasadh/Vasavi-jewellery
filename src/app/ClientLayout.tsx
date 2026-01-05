'use client';

import { LanguageProvider, useLanguage } from "@/context/LanguageContext";

function LanguageWrapper({ children }: { children: React.ReactNode }) {
    const { language } = useLanguage();
    return (
        <div className={language === 'ta' ? 'lang-ta' : ''}>
            {children}
        </div>
    );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <LanguageWrapper>
                {children}
            </LanguageWrapper>
        </LanguageProvider>
    );
}
