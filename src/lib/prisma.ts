import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    // Use Prisma Accelerate URL for cloud connection
    return new PrismaClient({
        accelerateUrl: process.env.PRISMA_DATABASE_URL
    })
}

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
