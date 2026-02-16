'use client';

import { useState, useEffect } from 'react';

export interface GoldRates {
    k22: number;
    k24: number;
}

export function useGoldRates() {
    const [rates, setRates] = useState<GoldRates | null>(() => {
        // Initialize from sessionStorage if available
        if (typeof window !== 'undefined') {
            const cached = sessionStorage.getItem('goldRates');
            if (cached) {
                try {
                    return JSON.parse(cached);
                } catch {
                    return null;
                }
            }
        }
        return null;
    });
    const [isSyncing, setIsSyncing] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);

    const fetchRates = async () => {
        if (hasFetched) return; // Prevent duplicate fetches

        setIsSyncing(true);
        setHasFetched(true);

        try {
            const res = await fetch('/api/gold-rate');
            const data = await res.json();
            if (data.k22 && data.k24) {
                const newRates = { k22: data.k22, k24: data.k24 };
                setRates(newRates);

                // Cache in sessionStorage
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('goldRates', JSON.stringify(newRates));
                }
            }
        } catch (err) {
            console.error("Failed to sync rates:", err);
            setHasFetched(false); // Allow retry on error
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        if (!rates) {
            fetchRates();
        }
    }, []);

    return { rates, isSyncing };
}
