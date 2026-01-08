const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Users in DB:');
    const users = await prisma.user.findMany();
    console.log(JSON.stringify(users, null, 2));
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
