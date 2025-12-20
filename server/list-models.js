require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // There isn't a direct listModels method on the client instance in some versions, 
        // but let's try to just use a known stable model to test connection first, 
        // or use the API to list models if possible. 
        // Actually, the error message itself suggested calling ListModels.
        // The SDK might not expose it directly in the main class in all versions, 
        // but let's try a standard 'gemini-pro' fallback or just print the error from a different model.

        // Let's try to use 'gemini-pro' which is usually standard.
        console.log("Trying gemini-pro...");
        const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await modelPro.generateContent("Test");
        console.log("gemini-pro works!");

        // Let's try 'gemini-1.5-flash-001'
        console.log("Trying gemini-1.5-flash-001...");
        const modelFlash = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
        const resultFlash = await modelFlash.generateContent("Test");
        console.log("gemini-1.5-flash-001 works!");

    } catch (error) {
        console.error("Error:", error.message);
    }
}

listModels();
