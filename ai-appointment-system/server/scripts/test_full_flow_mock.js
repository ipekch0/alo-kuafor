const { generateAIResponse } = require('../src/services/aiService');

async function testFlow() {
    console.log("Simulating AI Flow (No DB)...");

    // Mock Context
    const context = {
        salonName: "Test Salon",
        services: [{ name: "Saç Kesimi", duration: 30, price: 100 }],
        salonId: "mock-id",
        senderPhone: "905550000000"
    };

    const text = "Merhaba";
    console.log(`Input: "${text}"`);

    try {
        const response = await generateAIResponse(text, context);
        console.log("\n--- AI RESPONSE ---");
        console.log(response);
    } catch (e) {
        console.error("AI SIMULATION FAILED:", e);
    }
}

testFlow();
