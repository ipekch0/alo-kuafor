const { PrismaClient } = require('@prisma/client');
const { generateAIResponse } = require('../src/services/aiService');

const prisma = new PrismaClient();

async function runTest() {
    console.log('--- STARTING AI LOGIC TEST ---');

    try {
        // 1. Setup Data
        const salon = await prisma.salon.findFirst({ include: { services: true } });
        if (!salon) {
            console.error('No salon found via Prisma.');
            return;
        }

        console.log('Testing with Salon:', salon.name);

        // Update Working Hours
        const hours = {
            monday: { isOpen: true, start: "09:00", end: "18:00" },
            tuesday: { isOpen: true, start: "09:00", end: "18:00" },
            wednesday: { isOpen: true, start: "09:00", end: "18:00" },
            thursday: { isOpen: true, start: "09:00", end: "18:00" },
            friday: { isOpen: true, start: "09:00", end: "18:00" },
            saturday: { isOpen: true, start: "10:00", end: "14:00" }, // Short day
            sunday: { isOpen: false, start: "09:00", end: "18:00" } // Closed
        };

        await prisma.salon.update({
            where: { id: salon.id },
            data: { workingHours: JSON.stringify(hours) }
        });
        console.log('Updated Working Hours: M-F 9-18, Sat 10-14, Sun Closed');

        // Ensure Service
        let service = salon.services[0];
        if (!service) {
            service = await prisma.service.create({
                data: {
                    salonId: salon.id,
                    name: 'Test Kesim',
                    duration: 30,
                    price: 100
                }
            });
            console.log('Created Test Service');
        }

        // Test Context
        const context = {
            salonName: salon.name,
            services: [service],
            salonId: salon.id,
            senderPhone: '905551234567',
            workingHours: JSON.stringify(hours) // Simulate passing from router
        };

        // TEST 1: SUNDAY (Closed)
        // Note: Dates need to be real future dates to make sense generally, but let's see how AI handles "Pazar günü" mapping to date.
        // Actually, my AI prompt expects "YYYY-MM-DD" from tool calls.
        // I will simulate the USER input explicitly mentioning a date to avoid ambiguity in this script.

        // Find next Sunday
        const d = new Date();
        d.setDate(d.getDate() + (7 - d.getDay()) % 7); // Next Sunday (or today if Sunday)
        if (d.getDay() !== 0) d.setDate(d.getDate() + (7 - d.getDay() + 0) % 7); // Force Sunday
        const sundayStr = d.toISOString().split('T')[0];

        console.log(`\n--- TEST 1: CLOSED DAY (${sundayStr}) ---`);
        const res1 = await generateAIResponse(`Pazar günü (${sundayStr}) saat 12:00 saç kesimi randevusu istiyorum.`, context);
        console.log('AI Response:', res1);

        // TEST 2: MONDAY OK but LATE
        const d2 = new Date();
        d2.setDate(d2.getDate() + (1 + 7 - d2.getDay()) % 7); // Next Monday
        const mondayStr = d2.toISOString().split('T')[0];

        console.log(`\n--- TEST 2: LATE HOUR (${mondayStr} 20:00) ---`);
        const res2 = await generateAIResponse(`${mondayStr} saat 20:00 randevu`, context);
        console.log('AI Response:', res2);

        // TEST 3: MONDAY OK TIME
        console.log(`\n--- TEST 3: OK TIME (${mondayStr} 10:00) ---`);
        const res3 = await generateAIResponse(`${mondayStr} saat 10:00 randevu`, context);
        console.log('AI Response Check:', res3);

        // TEST 4: CREATE CONFLICT & RETRY
        console.log(`\n--- TEST 4: CONFLICT CHECK ---`);
        // Manually create appointment at 10:00
        await prisma.appointment.create({
            data: {
                salonId: salon.id,
                customerId: 1, // Assume existing or fail
                serviceId: service.id,
                professionalId: 1, // Assume existing
                dateTime: new Date(`${mondayStr}T10:00:00`),
                status: 'confirmed',
                totalPrice: 100
            }
        });
        console.log('Created blocking appointment at 10:00');

        const res4 = await generateAIResponse(`${mondayStr} saat 10:00 randevu`, context);
        console.log('AI Response Conflict:', res4);

    } catch (e) {
        console.error('Test Failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

runTest();
