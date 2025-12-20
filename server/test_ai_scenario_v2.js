
require('dotenv').config();
const { generateAIResponse } = require('./src/services/aiService');
const fs = require('fs');

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

// Hijack console.log
const originalLog = console.log;
function log(msg, ...args) {
    // Basic stringify for objects
    const formattedArgs = args.map(arg =>
        (typeof arg === 'object') ? JSON.stringify(arg) : arg
    );
    const text = [msg, ...formattedArgs].join(' ');

    // Write to stdout normally
    originalLog(text);

    // Write to file
    try {
        fs.appendFileSync('server/test_scenario_output.md', text + '\n');
    } catch (e) { }
}
console.log = log;
const originalError = console.error;
function logError(msg, ...args) {
    const text = "ERROR: " + [msg, ...args].join(' ');
    originalError(text); // Print to stderr (or stdout via originalLog for consistency in my environment?)
    // Actually, force to stdout or file
    try {
        fs.appendFileSync('server/test_scenario_output.md', text + '\n');
    } catch (e) { }
}
console.error = logError;

async function runScenario() {
    try {
        fs.writeFileSync('server/test_scenario_output.md', 'START SCENARIO V2\n');
        log("--- START SCENARIO TEST ---");

        // STEP 1: Check Availability
        log("\n[User]: Yarın 11:15 saç kesimi için uygun musunuz?");
        const response1 = await generateAIResponse("Yarın 11:15 saç kesimi için uygun musunuz?", mockContext);

        // Output from AI service is already logged via hijacked console.log if it uses it.
        // But main response is returned.
        log(`[AI RESPONSE 1]: ${response1}`);

        // Update History
        mockContext.history.push({ role: 'user', content: "Yarın 11:15 saç kesimi için uygun musunuz?" });
        // Clean response from JSON artifacts if any? No, aiService does that.
        // But the history should contain the TEXT response.
        mockContext.history.push({ role: 'model', content: response1 });

        // STEP 2: Provide Info
        log("\n[User]: Tamam, adım Test User, numaram bu, mailim test@example.com");

        const response2 = await generateAIResponse("Tamam, adım Test User, numaram bu, mailim test@example.com", mockContext);
        log(`[AI RESPONSE 2]: ${response2}`);

        log("\n--- END SCENARIO TEST ---");
    } catch (e) {
        log("ERROR:", e.stack);
    }
}

runScenario();
