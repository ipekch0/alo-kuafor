const { PrismaClient } = require('@prisma/client');

// Prevent multiple instances of Prisma Client in development
// and ensure a single instance in serverless environments
let prisma;

if (process.env.NODE_ENV === 'production') {
    try {
        console.log('[PRISMA] Initializing Prisma Client in PRODUCTION mode...');
        prisma = new PrismaClient();
        console.log('[PRISMA] Prisma Client initialized successfully.');
    } catch (e) {
        console.error('CRITICAL ERROR: Prisma Client Failed to Initialize in Production!', e.message);
        console.error('Stack Trace:', e.stack);
    }
} else {
    if (!global.prisma) {
        try {
            console.log('[PRISMA] Initializing Global Prisma Client for Development...');
            global.prisma = new PrismaClient();
        } catch (e) {
            console.error('CRITICAL ERROR: Global Prisma Client Failed in Development!', e.message);
        }
    }
    prisma = global.prisma;
}

module.exports = prisma;
