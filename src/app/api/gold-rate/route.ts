import { NextResponse } from 'next/server';

// Simple in-memory cache for demonstration (Note: resets on server restart in dev)
let cachedRates: { k22: number; k24: number; timestamp: number } | null = null;

export async function GET() {
    const API_KEY = 'goldapi-2hgrusmjltr1ph-io';
    const now = new Date();

    // Get hours and minutes in IST (local server time assumed to be IST or handled via offset)
    const currentTime = now.getHours() * 100 + now.getMinutes();

    // Check if we need to fetch based on your specific slots: 930, 1330, 1830
    // If cache is empty, always fetch. 
    // Otherwise, we check if the cache is "old" relative to the last slot.
    const lastUpdateHour = cachedRates ? new Date(cachedRates.timestamp * 1000).getHours() : -1;
    const lastUpdateTime = cachedRates ? (new Date(cachedRates.timestamp * 1000).getHours() * 100 + new Date(cachedRates.timestamp * 1000).getMinutes()) : -1;

    let shouldFetch = !cachedRates;

    // Logic: If it's past 9:30 and we haven't updated since before 9:30, fetch.
    if (!shouldFetch) {
        if (currentTime >= 930 && lastUpdateTime < 930) shouldFetch = true;
        else if (currentTime >= 1330 && lastUpdateTime < 1330) shouldFetch = true;
        else if (currentTime >= 1830 && lastUpdateTime < 1830) shouldFetch = true;
    }

    if (shouldFetch) {
        try {
            const response = await fetch('https://www.goldapi.io/api/XAU/INR', {
                headers: {
                    'x-access-token': API_KEY,
                    'Content-Type': 'application/json'
                },
                cache: 'no-store'
            });

            if (!response.ok) throw new Error('Failed to fetch gold rate');

            const data = await response.json();
            const markup = 1100;

            cachedRates = {
                k24: Math.round(data.price_gram_24k) + markup,
                k22: Math.round(data.price_gram_22k) + markup,
                timestamp: Math.floor(Date.now() / 1000)
            };
        } catch (error) {
            console.error('Gold API Error:', error);
            // If fetch fails, return cache if available
            if (!cachedRates) return NextResponse.json({ error: 'Failed to fetch rates' }, { status: 500 });
        }
    }

    return NextResponse.json(cachedRates);
}
