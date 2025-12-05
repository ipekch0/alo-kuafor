const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const axios = require('axios');

// WhatsApp API Configuration
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

// Helper to send message back to WhatsApp
// Helper to send message back to WhatsApp
const sendWhatsAppMessage = async (to, text) => {
    const fs = require('fs');
    const logFile = require('path').join(__dirname, '../../webhook.log');

    const log = (msg) => {
        const timestamp = new Date().toISOString();
        fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
    };

    try {
        await axios.post(
            `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: 'whatsapp',
                to: to,
                text: { body: text }
            },
            {
                headers: {
                    'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch (error) {
        const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
        log(`Error sending WhatsApp message: ${errorMsg}`);
        console.error('Error sending WhatsApp message:', errorMsg);
        throw new Error(errorMsg); // Re-throw to be caught by caller
    }
};

// GET /api/whatsapp/webhook - Verification
router.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(400);
    }
});

// POST /api/whatsapp/webhook - Receive Messages
router.post('/webhook', async (req, res) => {
    const fs = require('fs');
    const logFile = require('path').join(__dirname, '../../webhook.log');

    const log = (msg) => {
        const timestamp = new Date().toISOString();
        fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
        console.log(msg);
    };

    log('Incoming Webhook Request: ' + JSON.stringify(req.body, null, 2));
    try {
        const body = req.body;

        if (body.object) {
            if (
                body.entry &&
                body.entry[0].changes &&
                body.entry[0].changes[0].value.messages &&
                body.entry[0].changes[0].value.messages[0]
            ) {
                const message = body.entry[0].changes[0].value.messages[0];
                const from = message.from; // Sender's phone number
                const msgBody = message.text ? message.text.body : '';

                if (msgBody) {
                    log(`Received message from ${from}: ${msgBody}`);

                    // Process with AI
                    // We pass 'from' as sessionId to keep conversation history per user
                    try {
                        const aiResponse = await aiService.chat(msgBody, from);
                        log(`AI Response: ${JSON.stringify(aiResponse)}`);

                        // Send AI response back to user
                        await sendWhatsAppMessage(from, aiResponse.message);
                        log(`Message sent to ${from}`);
                    } catch (aiError) {
                        log(`AI Processing Error: ${aiError.message}`);
                    }
                }
            }
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        log('Webhook Error: ' + error.message);
        res.sendStatus(500);
    }
});

module.exports = router;
