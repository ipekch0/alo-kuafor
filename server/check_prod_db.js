const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://postgres:Baystbay5269@db.ggxdspkgfhbikorxlcpt.supabase.co:5432/postgres',
        },
    },
});

async function main() {
    try {
        await prisma.$connect();
        console.log('Successfully connected to the database!');
        process.exit(0);
    } catch (error) {
        console.error('Connection failed:', error);
        process.exit(1);
    }
}

main();
