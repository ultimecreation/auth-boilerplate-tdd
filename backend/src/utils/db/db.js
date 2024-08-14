import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma || new PrismaClient({
    datasources: {
        db: {
            url: process.env.NODE_ENV === 'test' ? 'file:./db/test.db' : 'file:./db/dev.db',
        },
    },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma