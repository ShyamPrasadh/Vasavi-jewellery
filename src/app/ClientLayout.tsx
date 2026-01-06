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

import Sidebar from './components/Sidebar';
import { Suspense } from 'react';

import { SidebarProvider, useSidebar } from "@/context/SidebarContext";

function LayoutContent({ children }: { children: React.ReactNode }) {
    const { isCollapsed } = useSidebar();

    return (
        <div className="flex min-h-screen bg-[#FDFCFB]">
            <Suspense fallback={<div className="w-[280px] bg-white h-screen border-r border-gray-100 hidden md:block" />}>
                <Sidebar />
            </Suspense>
            <main
                className={`flex-1 transition-all duration-300 ${isCollapsed ? 'md:ml-[88px]' : 'md:ml-[280px]'}`}
            >
                {children}
            </main>
        </div>
    );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <SidebarProvider>
                <LanguageWrapper>
                    <LayoutContent>
                        {children}
                    </LayoutContent>
                </LanguageWrapper>
            </SidebarProvider>
        </LanguageProvider>
    );
}
