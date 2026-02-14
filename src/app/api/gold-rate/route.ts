import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

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

    try {
        // 1. Get current cache from DB
        let cache = await prisma.goldRateCache.findUnique({
            where: { id: 'default' }
        });

        // DEBUG: Log cache state
        console.log('[Gold API - DEBUG] Cache from DB:', cache ? {
            id: cache.id,
            rate24k: cache.rate24k,
            rate22k: cache.rate22k,
            fetchCount: cache.fetchCount,
            lastFetchDate: cache.lastFetchDate,
            timestamp: cache.timestamp.toString(),
            age: `${((Date.now() - Number(cache.timestamp) * 1000) / (1000 * 60 * 60)).toFixed(2)} hours`
        } : 'NULL');

        // 2. Initialize if not exists or Reset if new day
        if (!cache) {
            // First time ever
            console.log('[Gold API] No cache found. Will initialize on first fetch.');
        } else if (cache.lastFetchDate !== todayIST) {
            // New day, reset count
            console.log(`[Gold API] New day detected (${todayIST}). Resetting fetch count.`);
            cache = await prisma.goldRateCache.update({
                where: { id: 'default' },
                data: {
                    fetchCount: 0,
                    lastFetchDate: todayIST
                }
            });
        }

        // 3. Determine if we should fetch
        let shouldFetch = false;
        let fetchReason = '';

        if (!cache) {
            shouldFetch = true;
            fetchReason = 'No cache exists';
        } else if (cache.fetchCount < MAX_DAILY_REQUESTS) {
            // Check staleness
            const lastUpdate = Number(cache.timestamp) * 1000;
            const hoursSinceLastFetch = (Date.now() - lastUpdate) / (1000 * 60 * 60);

            // Fetch if: > 4 hours old AND business hours (9AM-8PM)
            if (hoursSinceLastFetch >= 4 && currentHour >= 9 && currentHour <= 20) {
                shouldFetch = true;
                fetchReason = `Cache stale (${hoursSinceLastFetch.toFixed(2)} hrs old)`;
            } else {
                fetchReason = `Cache fresh (${hoursSinceLastFetch.toFixed(2)} hrs old, ${cache.fetchCount}/${MAX_DAILY_REQUESTS} fetches)`;
            }
        } else {
            fetchReason = `Daily limit reached (${cache.fetchCount}/${MAX_DAILY_REQUESTS})`;
        }

        console.log(`[Gold API - DEBUG] shouldFetch: ${shouldFetch}. Reason: ${fetchReason}`);

        // 4. Fetch from External API if needed
        if (shouldFetch) {
            const currentCount = cache?.fetchCount || 0;
            console.log(`[Gold API] ⚠️ EXTERNAL API CALL - Request ${currentCount + 1} of ${MAX_DAILY_REQUESTS} for ${todayIST}`);

            const response = await fetch('https://www.goldapi.io/api/XAU/INR', {
                headers: {
                    'x-access-token': API_KEY,
                    'Content-Type': 'application/json'
                },
                cache: 'no-store'
            });

            if (!response.ok) throw new Error(`External API Error: ${response.statusText}`);

            const data = await response.json();
            const markup = 1100;

            const k22_base = Math.round(data.price_gram_22k || (data.price_gram_24k * 0.916));
            const k22_final = k22_base + markup;
            const k24_final = Math.round(k22_final / 0.916);

            const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));

            // 5. Update DB
            cache = await prisma.goldRateCache.upsert({
                where: { id: 'default' },
                update: {
                    rate24k: k24_final,
                    rate22k: k22_final,
                    lastFetchDate: todayIST,
                    fetchCount: { increment: 1 },
                    timestamp: currentTimestamp
                },
                create: {
                    id: 'default',
                    rate24k: k24_final,
                    rate22k: k22_final,
                    lastFetchDate: todayIST,
                    fetchCount: 1,
                    timestamp: currentTimestamp
                }
            });

            console.log('[Gold API] ✅ Cache updated in DB. New count:', cache.fetchCount);

            // Log Success to File
            try {
                const logDir = '/tmp/log';
                if (!fs.existsSync(logDir)) {
                    fs.mkdirSync(logDir, { recursive: true });
                }
                const logFile = path.join(logDir, 'gold-rate.log');
                const logEntry = `[${new Date().toISOString()}] SUCCESS - Rates: 24k=${k24_final}, 22k=${k22_final}\n`;
                fs.appendFileSync(logFile, logEntry);
            } catch (fsError) {
                console.error('Failed to write to log file:', fsError);
            }

            console.log(`[Gold API] Successfully updated DB. New Count: ${cache.fetchCount}`);
        } else if (cache) {
            console.log(`[Gold API] Serving cached rates. Last fetch: ${cache.lastFetchDate} (${cache.fetchCount}/${MAX_DAILY_REQUESTS})`);
        }

        // Return Data
        if (cache) {
            return NextResponse.json({
                k24: cache.rate24k,
                k22: cache.rate22k,
                fetchCount: cache.fetchCount,
                maxDaily: MAX_DAILY_REQUESTS,
                lastUpdated: new Date(Number(cache.timestamp) * 1000).toISOString()
            });
        }

        return NextResponse.json({ error: 'No rates available' }, { status: 500 });

    } catch (error) {
        console.error('Gold API Error:', error);

        // Log Error to File
        try {
            const logDir = '/tmp/log';
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
            const logFile = path.join(logDir, 'gold-rate.log');
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            const logEntry = `[${new Date().toISOString()}] ERROR - ${errorMsg}\n`;
            fs.appendFileSync(logFile, logEntry);
        } catch (fsError) {
            console.error('Failed to write error log to file:', fsError);
        }

        // Fallback to existing cache if available (even if stale) during error
        const existing = await prisma.goldRateCache.findUnique({ where: { id: 'default' } });
        if (existing) {
            return NextResponse.json({
                k24: existing.rate24k,
                k22: existing.rate22k,
                fetchCount: existing.fetchCount,
                error: 'External fetch failed, serving stale data'
            });
        }
        return NextResponse.json({ error: 'Failed to fetch rates' }, { status: 500 });
    }
}
