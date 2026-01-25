const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

// Replace with YOUR phone number (format: 905xxxxxxxxx)
const TEST_PHONE_NUMBER = '905555555555'; 

async function sendTestMessage() {
    try {
        const salon = await prisma.salon.findFirst(); 
        if (!salon || !salon.whatsappAPIToken) {
            console.error("❌ No Salon or Token found!");
            return;
        }

        console.log(`✅ Using Token from Salon: ${salon.name}`);
        console.log(`📡 Sending test message...`);

        const url = `https://graph.facebook.com/v18.0/${salon.whatsappPhoneId}/messages`;
        
        await axios.post(url, {
            messaging_product: 'whatsapp',
            to: TEST_PHONE_NUMBER,
            type: "template",
            template: {
                name: "hello_world",
                language: { code: "en_US" }
            }
        }, {
            headers: {
                'Authorization': `Bearer ${salon.whatsappAPIToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("✅ Message SENT successfully! Check your WhatsApp.");

    } catch (e) {
        console.error("❌ Failed to send:", e.response ? e.response.data : e.message);
    } finally {
        await prisma.$disconnect();
    }
}

sendTestMessage();
