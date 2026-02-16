import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Verifying isFetching field...");
    try {
        const result = await prisma.goldRateCache.update({
            where: { id: 'default' },
            data: { isFetching: false }
        });
        console.log("SUCCESS: isFetching field exists and was updated:", result.isFetching);
    } catch (e) {
        console.error("FAILURE: Could not update isFetching:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
