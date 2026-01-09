import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const prismaClientSingleton = () => {
    // If PRISMA_DATABASE_URL is provided, use Prisma Accelerate
    if (process.env.PRISMA_DATABASE_URL) {
        return new PrismaClient({
            accelerateUrl: process.env.PRISMA_DATABASE_URL
        })
    }

    // In production or when engine type is 'client', we should use a driver adapter
    // Vercel environments often work best with this setup
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL

    if (connectionString) {
        const pool = new Pool({ connectionString })
        const adapter = new PrismaPg(pool)
        return new PrismaClient({ adapter })
    }

    // Default fallback for local development
    return new PrismaClient()
}

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
