import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), '.gold_cache.json');

function getCache() {
    try {
        if (fs.existsSync(CACHE_FILE)) {
            const data = fs.readFileSync(CACHE_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Cache read error:', e);
    }
    return null;
}

function setCache(data: any) {
    try {
        fs.writeFileSync(CACHE_FILE, JSON.stringify(data));
    } catch (e) {
        console.error('Cache write error:', e);
    }
}

export async function GET() {
    const API_KEY = 'goldapi-1lbve4smk56j3jz-io';
    const now = new Date();

    // Convert to IST time for accurate slot checking
    // Offset for IST is +5.5 hours (+330 minutes)
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istTime = new Date(utcTime + (330 * 60000));
    const currentTime = istTime.getHours() * 100 + istTime.getMinutes();

    let cachedRates = getCache();

    // Determine last update time from cache
    // Note: stored timestamp is in seconds, need to convert to IST Date
    const lastUpdateDate = cachedRates ? new Date((cachedRates.timestamp * 1000) + (330 * 60000) + (new Date().getTimezoneOffset() * 60000)) : null;
    const lastUpdateTime = lastUpdateDate ? (lastUpdateDate.getHours() * 100 + lastUpdateDate.getMinutes()) : -1;
    // Check if the cache is from today (to avoid using yesterday's 18:30 rate for today's 9:30 slot checks incorrectly)
    const isSameDay = lastUpdateDate ? (lastUpdateDate.getDate() === istTime.getDate() && lastUpdateDate.getMonth() === istTime.getMonth()) : false;

    let shouldFetch = !cachedRates;

    // Logic: Fetch only if we crossed a slot boundary since the last update
    // Slots: 09:00, 13:00, 18:00
    if (!shouldFetch && isSameDay) {
        if (currentTime >= 900 && lastUpdateTime < 900) shouldFetch = true;
        else if (currentTime >= 1300 && lastUpdateTime < 1300) shouldFetch = true;
        else if (currentTime >= 1800 && lastUpdateTime < 1800) shouldFetch = true;
    } else if (!isSameDay) {
        // If it's a new day and past 9:00, fetch
        if (currentTime >= 900) shouldFetch = true;
    }

    if (shouldFetch) {
        try {
            console.log('Fetching new gold rates from API...');
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

            const k22_base = Math.round(data.price_gram_22k || (data.price_gram_24k * 0.916));
            const k22_final = k22_base + markup;
            const k24_final = Math.round(k22_final / 0.916);

            cachedRates = {
                k24: k24_final,
                k22: k22_final,
                timestamp: Math.floor(Date.now() / 1000)
            };

            setCache(cachedRates);

        } catch (error) {
            console.error('Gold API Error:', error);
            // If fetch fails, return cache if available
            if (!cachedRates) return NextResponse.json({ error: 'Failed to fetch rates' }, { status: 500 });
        }
    }

    return NextResponse.json(cachedRates);
}
