
require('dotenv').config();
const { generateAIResponse } = require('./src/services/aiService');

// Mock Data
const mockContext = {
    salonName: "Test Salonu",
    salonId: 1,
    services: [
        { name: "Saç Kesimi", duration: 30, price: 100, id: 1 },
        { name: "Ombre", duration: 120, price: 500, id: 2 }
    ],
    senderPhone: "905551234567",
    workingHours: null, // Test NULL working hours handling
    history: []
};

async function runScenario() {
    console.log("--- START SCENARIO TEST ---");

    // STEP 1: Check Availability
    console.log("\n[User]: Yarın 14:00 saç kesimi için uygun musunuz?");
    const response1 = await generateAIResponse("Yarın 14:00 saç kesimi için uygun musunuz?", mockContext);
    console.log(`[AI]: ${response1}`);

    // Update History
    mockContext.history.push({ role: 'user', content: "Yarın 14:00 saç kesimi için uygun musunuz?" });
    mockContext.history.push({ role: 'model', content: response1 });

    // STEP 2: Provide Info
    console.log("\n[User]: Tamam, adım Test User, numaram bu, mailim test@example.com");
    // Ensure the AI actually has "MÜSAİT" context from previous turn internal tool call (which isn't fully persisted in this simple script unless AI output contains it).
    // In real app, AI tool execution happens inside generateAIResponse.

    // Simulate user providing info
    const response2 = await generateAIResponse("Tamam, adım Test User, numaram bu, mailim test@example.com", mockContext);
    console.log(`[AI]: ${response2}`);

    console.log("\n--- END SCENARIO TEST ---");
}

runScenario().catch(console.error);
