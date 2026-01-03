'use client';

import { useState, useEffect } from 'react';

export interface GoldRates {
    k22: number;
    k24: number;
}

export function useGoldRates() {
    const [rates, setRates] = useState<GoldRates | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const fetchRates = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch('/api/gold-rate');
            const data = await res.json();
            if (data.k22 && data.k24) {
                setRates({ k22: data.k22, k24: data.k24 });
                return { k22: data.k22, k24: data.k24 };
            }
        } catch (err) {
            console.error("Failed to sync rates:", err);
        } finally {
            setIsSyncing(false);
        }
        return null;
    };

    useEffect(() => {
        fetchRates();
        const interval = setInterval(fetchRates, 600000); // 10 min refresh
        return () => clearInterval(interval);
    }, []);

    return { rates, isSyncing, refresh: fetchRates };
}
