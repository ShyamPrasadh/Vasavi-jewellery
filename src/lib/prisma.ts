import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const prismaClientSingleton = () => {
    // 1. Prisma Accelerate (if URL provided)
    if (process.env.PRISMA_DATABASE_URL) {
        return new PrismaClient({
            accelerateUrl: process.env.PRISMA_DATABASE_URL
        })
    }

    // 2. PostgreSQL Adapter (Recommended for Vercel/Next.js)
    const connectionString = `${process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL}`

    if (connectionString && connectionString !== 'undefined') {
        const pool = new Pool({ connectionString })
        const adapter = new PrismaPg(pool)
        return new PrismaClient({ adapter })
    }

    // 3. Native Fallback (Local Development)
    return new PrismaClient()
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
