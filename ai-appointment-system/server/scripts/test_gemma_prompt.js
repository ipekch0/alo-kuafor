const axios = require('axios');
const API_KEY = "AIzaSyClNuFBQHmbWI_TTT5stSdZxflK0XpuAHo";
const MODEL = "models/gemma-3-1b-it";

async function testPrompt(text) {
    const services = [
        { name: "Saç Kesimi", duration: 30, price: 150 },
        { name: "Fön", duration: 15, price: 50 },
        { name: "Sakal Tıraşı", duration: 20, price: 100 }
    ];
    const servicesText = services.map(s => `- ${s.name} (${s.duration} dk) - ${s.price} TL`).join('\n');
    const today = new Date().toISOString().split('T')[0];

    const systemPrompt = `SYSTEM: You are an API backend. You reply ONLY in JSON.
DATE: ${today}
SERVICES:
${servicesText}

FORMATS:
1. Chat: { "text": "Your reply here" }
2. Check Availability: { "tool": "check_availability", "date": "YYYY-MM-DD", "time": "HH:mm" }
3. Create Booking: { "tool": "create_appointment", "serviceName": "Service", "date": "YYYY-MM-DD", "time": "HH:mm", "phone": "UserPhone" }

EXAMPLES:
USER: Merhaba
AI: { "text": "Merhaba! Yardımcı olabilir miyim?" }

USER: Fiyatlar?
AI: { "text": "Saç kesimi 150 TL." }

USER: Yarın 14:00 saç kesimi
AI: { "tool": "check_availability", "date": "2025-12-18", "time": "14:00" }

USER: ${text}
AI:`;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/${MODEL}:generateContent?key=${API_KEY}`;
        const res = await axios.post(url, {
            contents: [{ parts: [{ text: systemPrompt }] }]
        });
        console.log(`INPUT: "${text}"`);
        console.log(`OUTPUT:`, res.data.candidates[0].content.parts[0].text);
        console.log("---------------------------------------------------");
    } catch (e) {
        console.log("ERROR:", e.message);
    }
}

async function run() {
    console.log("--- TESTING BOOKING INTENT ---");
    await testPrompt("Yarın saat 14:00 için saç kesimi istiyorum");
}

run();
