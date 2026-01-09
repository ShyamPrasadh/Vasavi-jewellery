import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const prismaClientSingleton = () => {
    const options: any = {}

    // 1. Prisma Accelerate (if URL provided)
    if (process.env.PRISMA_DATABASE_URL) {
        options.accelerateUrl = process.env.PRISMA_DATABASE_URL
    } else {
        // 2. PostgreSQL Adapter (Recommended for Vercel/Next.js)
        const connectionString = `${process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL}`

        if (connectionString && connectionString !== 'undefined' && connectionString !== '' && connectionString !== 'null') {
            const pool = new Pool({ connectionString })
            const adapter = new PrismaPg(pool)
            options.adapter = adapter
        }
    }

    return new PrismaClient(options)
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
