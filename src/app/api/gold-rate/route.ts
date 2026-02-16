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
    const LOCK_TIMEOUT = 60 * 1000; // 1 minute

    const todayIST = getISTDate();
    const currentHour = getISTHour();
    const now = Date.now();

    try {
        // 1. Get current cache
        let cache = await prisma.goldRateCache.findUnique({
            where: { id: 'default' }
        });

        // 2. Initialize or Day Reset
        if (!cache) {
            // Will be handled by fetch logic
        } else if (cache.lastFetchDate !== todayIST) {
            console.log(`[Gold API] New day (${todayIST}). Resetting.`);
            // Reset and clear any stuck locks from yesterday
            cache = await prisma.goldRateCache.update({
                where: { id: 'default' },
                data: { fetchCount: 0, lastFetchDate: todayIST, isFetching: false }
            });
        } else {
            // Check Lock
            if (cache.isFetching) {
                const lastUpdate = Number(cache.timestamp) * 1000;
                if (now - lastUpdate < LOCK_TIMEOUT) {
                    console.log(`[Gold API] 🔒 Fetch in progress. Returning stale data.`);
                    return NextResponse.json({
                        k24: cache.rate24k,
                        k22: cache.rate22k,
                        fetchCount: cache.fetchCount,
                        maxDaily: MAX_DAILY_REQUESTS,
                        lastUpdated: new Date(Number(cache.timestamp) * 1000).toISOString(),
                        status: 'fetching'
                    });
                }
                console.log(`[Gold API] ⚠️ Stale lock found. Re-acquiring.`);
            }
        }

        // 3. Decide to Fetch
        let shouldFetch = false;
        if (!cache) {
            shouldFetch = true;
        } else if (cache.fetchCount < MAX_DAILY_REQUESTS) {
            // Check staleness
            const lastUpdate = Number(cache.timestamp) * 1000;
            const msgAge = (now - lastUpdate) / (1000 * 60 * 60);

            // Fetch if > 4 hours old AND within business hours (9AM-8PM)
            if (msgAge >= 4 && currentHour >= 9 && currentHour <= 20) {
                shouldFetch = true;
            }
        }

        // 4. Fetch & Lock
        if (shouldFetch) {
            // Atomic Lock Acquisition
            let lockAcquired = false;

            if (cache) {
                const updateResult = await prisma.goldRateCache.updateMany({
                    where: { id: 'default', isFetching: false },
                    data: { isFetching: true, timestamp: Math.floor(now / 1000) }
                });
                lockAcquired = updateResult.count > 0;
            } else {
                lockAcquired = true; // First time creation
            }

            if (!lockAcquired && cache) {
                console.log(`[Gold API] 🔒 Lock contention. Lost race. Returning stale.`);
                const fresh = await prisma.goldRateCache.findUnique({ where: { id: 'default' } });
                return NextResponse.json({
                    k24: fresh?.rate24k || cache.rate24k,
                    k22: fresh?.rate22k || cache.rate22k,
                    fetchCount: fresh?.fetchCount || cache.fetchCount,
                    lastUpdated: new Date(Number(fresh?.timestamp || 0) * 1000).toISOString()
                });
            }

            // Proceed with Fetch
            try {
                const currentCount = cache?.fetchCount || 0;
                console.log(`[Gold API] ⚠️ WRITING TO EXTERNAL API - Request ${currentCount + 1}/${MAX_DAILY_REQUESTS}`);

                const response = await fetch('https://www.goldapi.io/api/XAU/INR', {
                    headers: { 'x-access-token': API_KEY, 'Content-Type': 'application/json' },
                    cache: 'no-store'
                });

                if (!response.ok) throw new Error(`External API Error: ${response.statusText}`);

                const data = await response.json();
                const markup = 1100;
                const k22_base = Math.round(data.price_gram_22k || (data.price_gram_24k * 0.916));
                const k22_final = k22_base + markup;
                const k24_final = Math.round(k22_final / 0.916);
                const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));

                // Update & Release Lock
                cache = await prisma.goldRateCache.upsert({
                    where: { id: 'default' },
                    update: {
                        rate24k: k24_final,
                        rate22k: k22_final,
                        lastFetchDate: todayIST,
                        fetchCount: { increment: 1 },
                        timestamp: currentTimestamp,
                        isFetching: false
                    },
                    create: {
                        id: 'default',
                        rate24k: k24_final,
                        rate22k: k22_final,
                        lastFetchDate: todayIST,
                        fetchCount: 1,
                        timestamp: currentTimestamp,
                        isFetching: false
                    }
                });

                // Log Success
                try {
                    const logDir = '/tmp/log';
                    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
                    fs.appendFileSync(path.join(logDir, 'gold-rate.log'),
                        `[${new Date().toISOString()}] SUCCESS - Rates: 24k=${k24_final}, 22k=${k22_final}\n`);
                } catch (e) { console.error('Log write failed', e); }

                console.log(`[Gold API] ✅ Success. New Count: ${cache.fetchCount}`);

            } catch (err) {
                console.error("Fetch failed, releasing lock:", err);
                await prisma.goldRateCache.updateMany({
                    where: { id: 'default' },
                    data: { isFetching: false }
                });

                // Log error
                try {
                    const logDir = '/tmp/log';
                    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
                    fs.appendFileSync(path.join(logDir, 'gold-rate.log'),
                        `[${new Date().toISOString()}] ERROR - ${err instanceof Error ? err.message : 'Unknown'}\n`);
                } catch (e) { console.error('Log write failed', e); }

                throw err;
            }
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
        console.error('Final API Error:', error);
        const existing = await prisma.goldRateCache.findUnique({ where: { id: 'default' } });
        if (existing) {
            return NextResponse.json({
                k24: existing.rate24k,
                k22: existing.rate22k,
                fetchCount: existing.fetchCount,
                error: 'External fetch failed, serving stale data'
            });
        }
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
