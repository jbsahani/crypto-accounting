import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

function createPrismaClient() {
    const url = process.env.DATABASE_URL
    const authToken = process.env.DATABASE_AUTH_TOKEN

    if (process.env.NODE_ENV === 'production' && !url) {
        throw new Error('DATABASE_URL is not set in production')
    }

    const adapter = new PrismaLibSql({
        url: url || 'file:dev.db',
        authToken: authToken,
    })

    return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
