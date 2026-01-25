
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { chat } = require('../src/services/aiService');
const fs = require('fs');

const LOG_FILE = 'history_test_result.md';

function log(message) {
    console.log(message);
    fs.appendFileSync(LOG_FILE, message + '\n');
}

// Hook console.log to capture AI debug logs
const originalLog = console.log;
console.log = function (...args) {
    const msg = args.map(a => String(a)).join(' ');
    originalLog.apply(console, args);
    fs.appendFileSync(LOG_FILE, msg + '\n');
};

async function testHistory() {
    fs.writeFileSync(LOG_FILE, '# History Test Results\n\n');
    log("--- Testing History Injection ---");

    // Mock Context with History
    const context = {
        salonName: "Test Salon",
        services: [],
        history: [
            { role: 'user', content: "Merhaba" },
            { role: 'assistant', content: "Merhaba, size nasıl yardımcı olabilirim?" },
            { role: 'user', content: "Randevu almak istiyorum" }
        ]
    };

    // Simulate AI call
    const response = await chat("Randevu almak istiyorum", "905551234567", context);

    log("AI Response: " + response.message);

    if (response.message.toLowerCase().includes("merhaba")) {
        log("FAILURE: AI repeated greeting.");
    } else {
        log("SUCCESS: AI likely used history (no greeting).");
    }
}

testHistory().catch(err => log("ERROR: " + err)).finally(async () => {
    await prisma.$disconnect();
});
