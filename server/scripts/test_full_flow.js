const { generateAIResponse } = require('../src/services/aiService');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') }); // Explicit load
const prisma = new PrismaClient();

async function testFlow() {
    console.log("Simulating Webhook Flow...");
    console.log("DB URL Present:", !!process.env.DATABASE_URL);
    try {
        // Mock Data based on what handleIncomingMessage does
        const salon = await prisma.salon.findFirst({
            include: { services: true }
        });

        if (!salon) {
            console.error("No salon found in DB to test with!");
            return;
        }

        console.log(`Using Salon: ${salon.name} (ID: ${salon.id})`);

        const senderPhone = "905551234567";
        const text = "Merhaba, randevu almak istiyorum";

        console.log(`Input Text: "${text}"`);

        const response = await generateAIResponse(text, {
            salonName: salon.name,
            services: salon.services,
            salonId: salon.id,
            senderPhone: senderPhone
        });

        console.log("\n--- AI RESPONSE ---");
        console.log(response);
        console.log("-------------------");

    } catch (e) {
        const fs = require('fs');
        fs.writeFileSync('server/flow_error.log', require('util').inspect(e, { showHidden: true, depth: null }));
        console.error("FLOW FAILED (Logged to file)");
    } finally {
        await prisma.$disconnect();
    }
}

testFlow();
