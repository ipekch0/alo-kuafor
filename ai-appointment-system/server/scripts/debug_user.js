const path = require('path');
const { PrismaClient } = require('@prisma/client');

const dbPath = path.join(__dirname, '../dev.db');
const url = `file:${dbPath}`;
console.log("URL:", url);

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: url
        }
    }
});

async function main() {
    try {
        const user = await prisma.user.create({
            data: {
                name: "Test Owner",
                email: "owner_debug@demo.com",
                password: "hash",
                role: "salon_owner"
            }
        });
        console.log("✅ User created:", user);
    } catch (e) {
        console.error("❌ ERROR:");
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
