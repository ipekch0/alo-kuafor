
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// MOCK DATA
const mockWorkingHours = {
    "monday": { "start": "09:00", "end": "19:00", "isOpen": true },
    "tuesday": { "start": "09:00", "end": "19:00", "isOpen": true },
    "wednesday": { "start": "09:00", "end": "19:00", "isOpen": true },
    "thursday": { "start": "09:00", "end": "19:00", "isOpen": true },
    "friday": { "start": "09:00", "end": "19:00", "isOpen": true },
    "saturday": { "start": "09:00", "end": "19:00", "isOpen": true },
    "sunday": { "start": "09:00", "end": "19:00", "isOpen": false }
};

// SIMULATE checkSlot Logic from aiService.js
const checkSlot = async (dateStr, timeStr, workingHours) => {
    let parsedHours = workingHours;

    // Normalize keys just like in aiService.js
    const normalizedHours = {};
    Object.keys(parsedHours).forEach(k => {
        normalizedHours[k.toLowerCase()] = parsedHours[k];
    });

    let reqDate;
    try {
        reqDate = new Date(`${dateStr}T${timeStr}:00`);
    } catch (e) {
        return "Invalid Date";
    }

    const dayName = reqDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    // Existing Mapping Logic
    const trMap = {
        'monday': 'pazartesi', 'tuesday': 'salı', 'wednesday': 'çarşamba',
        'thursday': 'perşembe', 'friday': 'cuma', 'saturday': 'cumartesi', 'sunday': 'pazar'
    };
    const trDayName = trMap[dayName] || '';

    let dayHours = normalizedHours[dayName] || normalizedHours[trDayName];

    console.log(`Checking: ${dateStr} ${timeStr} (${dayName})`);
    console.log(`Found Hours:`, dayHours);

    if (!dayHours) return "KAPALI (No hours found)";

    const isDayOpen = dayHours.active !== undefined ? dayHours.active : dayHours.isOpen;
    if (!isDayOpen) return "KAPALI (Not active/open)";

    // Time Check
    const [openH, openM] = dayHours.start.split(':').map(Number);
    const [closeH, closeM] = dayHours.end.split(':').map(Number);
    const [reqH, reqM] = timeStr.split(':').map(Number);

    const reqMin = reqH * 60 + reqM;
    const openMin = openH * 60 + openM;
    const closeMin = closeH * 60 + closeM;

    if (reqMin < openMin || reqMin >= closeMin) {
        return `KAPALI (Saat dışı: ${dayHours.start} - ${dayHours.end})`;
    }

    return "MÜSAİT";
};

async function run() {
    console.log("--- TEST 1: Normal Weekday (Wednesday) ---");
    // Assuming next Wednesday is e.g., 2025-12-24
    let res1 = await checkSlot("2025-12-24", "14:00", mockWorkingHours);
    console.log("Result 1:", res1);

    console.log("\n--- TEST 2: Sunday (Closed) ---");
    let res2 = await checkSlot("2025-12-21", "14:00", mockWorkingHours);
    console.log("Result 2:", res2);

    console.log("\n--- TEST 3: Late Night (Closed) ---");
    let res3 = await checkSlot("2025-12-24", "23:00", mockWorkingHours);
    console.log("Result 3:", res3);
}

run();
