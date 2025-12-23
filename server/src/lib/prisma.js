const { PrismaClient } = require('@prisma/client');

// Prevent multiple instances of Prisma Client in development
// and ensure a single instance in serverless environments
let prisma;

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient();
} else {
    if (!global.prisma) {
        global.prisma = new PrismaClient();
    }
    prisma = global.prisma;
}

module.exports = prisma;
