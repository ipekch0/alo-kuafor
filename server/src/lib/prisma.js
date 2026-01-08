const { PrismaClient } = require('@prisma/client');

// Prevent multiple instances of Prisma Client in development
// and ensure a single instance in serverless environments
let prisma;

if (process.env.NODE_ENV === 'production') {
    try {
        prisma = new PrismaClient();
    } catch (e) {
        console.error('CRITICAL: Prisma Client Failed to Initialize', e);
        // Fallback or let it be undefined - usage will check
    }
} else {
    if (!global.prisma) {
        try {
            global.prisma = new PrismaClient();
        } catch (e) {
            console.error('CRITICAL: Global Prisma Client Failed', e);
        }
    }
    prisma = global.prisma;
}

module.exports = prisma;
