import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), '.gold_cache.json');

interface CacheData {
    k24: number;
    k22: number;
    lastFetchDate: string; // YYYY-MM-DD format
    fetchCount: number; // Number of API calls made today
    timestamp: number;
}

function getCache(): CacheData | null {
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

function setCache(data: CacheData) {
    try {
        fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Cache write error:', e);
    }
}

// Get current date in IST (YYYY-MM-DD format)
function getISTDate(): string {
    const now = new Date();
    // IST is UTC+5:30
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset + (now.getTimezoneOffset() * 60000));
    return istTime.toISOString().split('T')[0];
}

// Get current hour in IST (0-23)
function getISTHour(): number {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset + (now.getTimezoneOffset() * 60000));
    return istTime.getHours();
}

export async function GET() {
    const API_KEY = 'goldapi-1lbve4smk56j3jz-io';
    const MAX_DAILY_REQUESTS = 3;

    const todayIST = getISTDate();
    const currentHour = getISTHour();

    let cachedRates = getCache();

    // Reset fetch count if it's a new day
    if (cachedRates && cachedRates.lastFetchDate !== todayIST) {
        cachedRates.fetchCount = 0;
        cachedRates.lastFetchDate = todayIST;
    }

    // Determine if we should fetch (3 slots: morning 9-12, afternoon 13-17, evening 18+)
    let shouldFetch = false;

    if (!cachedRates) {
        // No cache at all, must fetch
        shouldFetch = true;
    } else if (cachedRates.fetchCount < MAX_DAILY_REQUESTS) {
        // Only fetch if we haven't hit the daily limit
        // Check if we're in a new slot that we haven't fetched for yet
        const cacheTimestamp = cachedRates.timestamp * 1000;
        const hoursSinceLastFetch = (Date.now() - cacheTimestamp) / (1000 * 60 * 60);

        // Fetch if: more than 4 hours since last fetch AND within reasonable hours (9-20)
        if (hoursSinceLastFetch >= 4 && currentHour >= 9 && currentHour <= 20) {
            shouldFetch = true;
        }
    }

    if (shouldFetch) {
        try {
            console.log(`[Gold API] Fetching rates... (Request ${(cachedRates?.fetchCount || 0) + 1} of ${MAX_DAILY_REQUESTS} for ${todayIST})`);

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
                lastFetchDate: todayIST,
                fetchCount: (cachedRates?.fetchCount || 0) + 1,
                timestamp: Math.floor(Date.now() / 1000)
            };

            setCache(cachedRates);
            console.log(`[Gold API] Successfully updated rates. Count today: ${cachedRates.fetchCount}`);

        } catch (error) {
            console.error('Gold API Error:', error);
            if (!cachedRates) {
                return NextResponse.json({ error: 'Failed to fetch rates' }, { status: 500 });
            }
        }
    } else if (cachedRates) {
        console.log(`[Gold API] Using cached rates from ${cachedRates.lastFetchDate}. Fetches today: ${cachedRates.fetchCount}/${MAX_DAILY_REQUESTS}`);
    }

    return NextResponse.json({
        k24: cachedRates?.k24,
        k22: cachedRates?.k22,
        fetchCount: cachedRates?.fetchCount || 0,
        maxDaily: MAX_DAILY_REQUESTS
    });
}
