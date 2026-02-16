import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// Load .env manually
const envPath = path.join(process.cwd(), '.env');
console.log('Loading env from:', envPath);

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
            if (key && value && !key.startsWith('#')) {
                process.env[key] = value;
            }
        }
    });
}

const url = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
console.log(`Database URL found: ${!!url}`);

const prisma = new PrismaClient()

async function main() {
    console.log("Verifying isFetching field...");
    try {
        const result = await prisma.goldRateCache.update({
            where: { id: 'default' },
            data: { isFetching: false }
        });
        console.log("SUCCESS: isFetching field updated. Current value:", result.isFetching);
    } catch (e) {
        console.error("FAILURE:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
