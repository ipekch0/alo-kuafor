const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function debugOwnership() {
    try {
        console.log("--- DEBUG OWNERSHIP ---");

        // 1. List all Users
        const users = await prisma.user.findMany({
            select: { id: true, email: true, role: true, name: true }
        });
        console.log("\nALL USERS:");
        console.table(users);

        // 2. List all Salons and their Owners
        const salons = await prisma.salon.findMany({
            include: { owner: { select: { email: true } } }
        });
        console.log("\nALL SALONS:");
        salons.forEach(s => {
            console.log(`ID: ${s.id} | Name: ${s.name} | OwnerID: ${s.ownerId} (${s.owner.email})`);
        });

        // 3. List Completed Appointments
        const appointments = await prisma.appointment.findMany({
            where: { status: 'completed' },
            take: 5,
            orderBy: { updatedAt: 'desc' },
            include: { salon: { select: { name: true } } }
        });
        console.log("\nLAST 5 COMPLETED APPOINTMENTS:");
        appointments.forEach(a => {
            console.log(`AppID: ${a.id} | Salon: ${a.salon.name} (${a.salonId}) | Price: ${a.totalPrice} | Paid: ${a.isPaid}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

debugOwnership();
