
const { generateAIResponse, setPrisma } = require('../src/services/aiService');
const fs = require('fs');

const LOG_FILE = 'test_result.md';

function log(message, data = null) {
    const timestamp = new Date().toISOString();
    let logMsg = `[${timestamp}] ${message}`;
    if (data) {
        logMsg += `\n${JSON.stringify(data, null, 2)}`;
    }
    console.log(logMsg);
    fs.appendFileSync(LOG_FILE, logMsg + '\n\n');
}

// Mock Prisma
const mockPrisma = {
    appointment: {
        findFirst: async () => null, // No conflict
        create: async (args) => {
            log("MOCK DB: Creating Appointment", args);
            return { id: 123, ...args.data };
        }
    },
    customer: {
        findUnique: async () => null, // New customer
        create: async (args) => {
            log("MOCK DB: Creating Customer", args);
            return { id: 999, ...args.data };
        },
        update: async (args) => {
            log("MOCK DB: Updating Customer", args);
            return { id: 999, ...args.data };
        }
    },
    professional: {
        findFirst: async () => ({ id: 1, name: "Staff" })
    }
};

// Inject Mock
setPrisma(mockPrisma);

async function testAIFlow() {
    // Clear log file
    fs.writeFileSync(LOG_FILE, '# Test Results\n\n');

    log("--- Starting AI Flow Test (MOCKED DB) ---");

    // Mock Context
    const context = {
        salonName: "Test Salon",
        services: [{ name: "Saç Kesimi", duration: 30, price: 100, id: 1 }],
        salonId: 1,
        senderPhone: "905551234567",
        workingHours: JSON.stringify({
            monday: { start: "09:00", end: "19:00", isOpen: true, active: true },
            tuesday: { start: "09:00", end: "19:00", isOpen: true, active: true },
            wednesday: { start: "09:00", end: "19:00", isOpen: true, active: true },
            thursday: { start: "09:00", end: "19:00", isOpen: true, active: true },
            friday: { start: "09:00", end: "19:00", isOpen: true, active: true },
            saturday: { start: "09:00", end: "19:00", isOpen: true, active: true },
            sunday: { start: "09:00", end: "19:00", isOpen: true, active: true }
        })
    };

    // 1. User asks for availability
    log("\nStep 1: User asks for availability");
    let response = await generateAIResponse("Yarın 14:00 saç kesimi için boş musunuz?", context);
    log("AI Response:", response);

    // 2. User provides details
    log("\nStep 2: User provides details");
    context.history = [
        { role: 'user', content: "Yarın 14:00 saç kesimi için boş musunuz?" },
        { role: 'assistant', content: response }
    ];

    let response2 = await generateAIResponse("Adım Ahmet Yılmaz, emailim ahmet@test.com", context);
    log("AI Response 2:", response2);

    if (response2.includes("BAŞARILI")) {
        log("\nSUCCESS: Appointment creation triggered.");
    } else {
        log("\nFAILURE: AI did not create appointment or asked for more info.");
    }
}

testAIFlow().catch(err => log("ERROR:", err));
