const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { generateAIResponse } = require('../services/aiService');
const crypto = require('crypto');

// Helper for file logging
const logToFile = (data) => {
    try {
        const logPath = path.join(__dirname, '../../debug_log_new.txt');
        const timestamp = new Date().toISOString();
        const message = `[${timestamp}] ${typeof data === 'string' ? data : JSON.stringify(data, null, 2)}\n`;
        fs.appendFileSync(logPath, message);
    } catch (e) {
        console.error('Logging failed:', e);
    }
};

// Test Route
router.get('/test', (req, res) => {
    logToFile('Test route hit!');
    res.json({ message: 'Cloud API Router is working!' });
});

// Note: authenticateToken is applied in index.js for this router -> MOVED to specific routes
const authenticateToken = require('../middleware/auth');

// Exchange Code for Token (Official Meta Flow)
router.post('/exchange-token', authenticateToken, async (req, res) => {
    try {
        const { code } = req.body;
        const msg = `Received request with code/token: ${code ? code.substring(0, 10) + '...' : 'NULL'}`;
        console.log(msg);
        logToFile(msg);

        const userId = req.user.id;

        // 1. Exchange Short-Lived Token for Long-Lived Token
        const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?` +
            `grant_type=fb_exchange_token&` +
            `client_id=${process.env.FACEBOOK_APP_ID}&` +
            `client_secret=${process.env.FACEBOOK_APP_SECRET}&` +
            `fb_exchange_token=${code}`;

        console.log('Exchanging access token for User ID:', userId);

        const tokenRes = await axios.get(tokenUrl);
        const accessToken = tokenRes.data.access_token;

        if (!accessToken) throw new Error('Failed to get access token');
        console.log('Long-lived access token received.');

        // ... rest of the logic ...

        // 2. Identify the WABA (WhatsApp Business Account) ID
        // Use App Access Token for debugging to ensure we can inspect any user token
        const appAccessToken = `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`;
        const debugUrl = `https://graph.facebook.com/v18.0/debug_token?` +
            `input_token=${accessToken}&` +
            `access_token=${appAccessToken}`;

        const debugRes = await axios.get(debugUrl);
        const granularScopes = debugRes.data.data.granular_scopes;

        logToFile({ msg: 'Debug Token Response', data: debugRes.data });

        let wabaId = null;
        if (granularScopes) {
            const whatsappScope = granularScopes.find(scope => scope.scope === 'whatsapp_business_management');
            if (whatsappScope && whatsappScope.target_ids && whatsappScope.target_ids.length > 0) {
                wabaId = whatsappScope.target_ids[0];
            }
        }

        if (!wabaId) {
            const warningMsg = 'WABA ID not found in granular scopes. Attempting fallback...';
            logToFile({ msg: warningMsg, scopes: granularScopes });

            // Fallback: Fetch User's WABAs directly (Requires 'whatsapp_business_management' scope only)
            try {
                // OLD (Failed): me?fields=businesses... -> Requires 'business_management'
                // NEW (Fix): me?fields=client_whatsapp_business_accounts... -> Requires 'whatsapp_business_management'
                const meUrl = `https://graph.facebook.com/v18.0/me?fields=businesses{id,name,owned_whatsapp_business_accounts{id,name}}&access_token=${accessToken}`;
                const meRes = await axios.get(meUrl);

                logToFile({ msg: 'Me/Businesses Response', data: meRes.data });

                const businesses = meRes.data.businesses?.data || [];
                for (const business of businesses) {
                    if (business.owned_whatsapp_business_accounts?.data?.length > 0) {
                        wabaId = business.owned_whatsapp_business_accounts.data[0].id;
                        logToFile({ msg: 'Found WABA ID via businesses > owned_wab', wabaId: wabaId });
                        break;
                    }
                }

            } catch (fallbackError) {
                logToFile({ msg: 'Fallback WABA fetch failed', error: fallbackError.message, response: fallbackError.response?.data });
                console.error('Fallback WABA fetch failed:', fallbackError);
            }

            if (!wabaId) {
                throw new Error('WhatsApp Business Account ID could not be identified. Please ensure you have a WhatsApp Business Account created under your Facebook Business Manager.');
            }
        }

        // 3. Get Phone Number ID
        const phoneUrl = `https://graph.facebook.com/v18.0/${wabaId}/phone_numbers?access_token=${accessToken}`;
        const phoneRes = await axios.get(phoneUrl);

        if (!phoneRes.data.data || phoneRes.data.data.length === 0) {
            throw new Error('No WhatsApp phone number found for this business account.');
        }

        const phoneNumberId = phoneRes.data.data[0].id;
        const phoneNumber = phoneRes.data.data[0].display_phone_number;

        // 4. Update Database
        const salon = await prisma.salon.findFirst({
            where: { ownerId: userId }
        });

        if (!salon) {
            throw new Error('Salon not found for this user.');
        }

        const updatedSalon = await prisma.salon.update({
            where: { id: salon.id },
            data: {
                whatsappAPIToken: accessToken,
                whatsappBusinessId: wabaId,
                whatsappPhoneId: phoneNumberId,
            }
        });

        // 5. Subscribe WABA to Webhooks
        try {
            await axios.post(`https://graph.facebook.com/v18.0/${wabaId}/subscribed_apps`, {
                access_token: accessToken
            });
            console.log('Subscribed WABA to webhooks');
        } catch (subError) {
            console.warn('Webhook subscription warning:', subError.response?.data || subError.message);
        }

        res.json({
            success: true,
            message: 'WhatsApp integration successful',
            phone: phoneNumber
        });

    } catch (error) {
        logToFile({ msg: 'Exchange Token Error', error: error.message, details: error.response?.data });
        console.error('Exchange Token Error:', error.response?.data || error.message);
        console.error('Full Error Object:', error); // DEBUG LOG
        res.status(500).json({ error: error.message || 'Token exchange failed', details: error.response?.data });
    }
});

// Manual Connection (Bypass Meta Permission Issues)
router.post('/manual-connect', authenticateToken, async (req, res) => {
    try {
        const { phoneId, wabaId, token } = req.body;
        const userId = req.user.id;

        if (!phoneId || !wabaId || !token) {
            return res.status(400).json({ error: 'Eksik bilgi.' });
        }

        const salon = await prisma.salon.findFirst({ where: { ownerId: userId } });
        if (!salon) return res.status(404).json({ error: 'Salon bulunamadı.' });

        // Check if this Phone ID is already used by ANOTHER salon
        const existingSalon = await prisma.salon.findFirst({
            where: {
                whatsappPhoneId: phoneId,
                NOT: { id: salon.id }
            }
        });

        if (existingSalon) {
            console.log(`Phone ID ${phoneId} is used by salon ${existingSalon.id}. Disconnecting it first.`);
            await prisma.salon.update({
                where: { id: existingSalon.id },
                data: { whatsappPhoneId: null, whatsappBusinessId: null, whatsappAPIToken: null }
            });
        }

        await prisma.salon.update({
            where: { id: salon.id },
            data: {
                whatsappAPIToken: token,
                whatsappBusinessId: wabaId,
                whatsappPhoneId: phoneId
            }
        });

        // Try webhook sub (best effort)
        try {
            await axios.post(`https://graph.facebook.com/v18.0/${wabaId}/subscribed_apps`, {
                access_token: token
            });
        } catch (e) {
            console.log('Webhook sub skipped/failed (expected on localhost).');
        }

        res.json({ success: true, message: 'Bağlantı güncellendi.' });

    } catch (error) {
        logToFile({ msg: 'Manual Connect Error', error: error.message, stack: error.stack });
        console.error('Manual Connect Error:', error);
        res.status(500).json({ error: 'Sunucu hatası: ' + error.message });
    }
});

// Middleware: Verify Webhook Signature
const verifyWebhookSignature = (req, res, next) => {
    try {
        // Skip if secret is missing (dev mode warning)
        if (!process.env.FACEBOOK_APP_SECRET) {
            console.warn('⚠️ WARNING: FACEBOOK_APP_SECRET is not set. Skipping signature verification.');
            return next();
        }

        const signature = req.headers['x-hub-signature-256'];
        if (!signature) {
            console.warn('⚠️ Webhook received without signature.');
            return res.status(401).json({ error: 'No signature found' });
        }

        const elements = signature.split('=');
        const signatureHash = elements[1];

        // Use rawBody if available (from index.js), otherwise stringify (unreliable but fallback)
        const payload = req.rawBody || JSON.stringify(req.body);

        const expectedHash = crypto
            .createHmac('sha256', process.env.FACEBOOK_APP_SECRET)
            .update(payload)
            .digest('hex');

        if (signatureHash !== expectedHash) {
            console.error('❌ Signature mismatch!');
            return res.status(401).json({ error: 'Invalid signature' });
        }

        next();
    } catch (err) {
        console.error('Signature verification error:', err);
        res.status(500).send('Internal Server Error');
    }
};

// Webhook for Incoming Messages
router.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

router.post('/webhook', verifyWebhookSignature, async (req, res) => {
    try {
        const body = req.body;
        console.log('🚀 WEBHOOK HIT! Body:', JSON.stringify(body, null, 2));

        if (body.object) {
            // 1. Handle Status Updates (Delivered, Read, etc.) to prevent 404s
            if (
                body.entry &&
                body.entry[0].changes &&
                body.entry[0].changes[0] &&
                body.entry[0].changes[0].value.statuses
            ) {
                // We acknowledge status updates but don't process them yet
                return res.sendStatus(200);
            }

            // 2. Handle Messages
            if (
                body.entry &&
                body.entry[0].changes &&
                body.entry[0].changes[0] &&
                body.entry[0].changes[0].value.messages &&
                body.entry[0].changes[0].value.messages[0]
            ) {
                const change = body.entry[0].changes[0].value;
                const message = change.messages[0];
                const from = message.from; // User's phone number
                const msgBody = message.text?.body || '';
                const phoneNumberId = change.metadata.phone_number_id;

                handleIncomingMessage(phoneNumberId, from, msgBody);
            }
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.error('Webhook Error:', error);
        res.sendStatus(500);
    }
});

// Helper to handle AI interaction
async function handleIncomingMessage(phoneId, from, text) {
    try {
        const salon = await prisma.salon.findFirst({
            where: { whatsappPhoneId: phoneId },
            include: { services: true }
        });

        if (!salon || !salon.whatsappAPIToken) {
            console.log('Salon not found or not connected for phoneId:', phoneId);
            return;
        }

        console.log(`Received WhatsApp message from ${from} for salon ${salon.name}: ${text}`);

        // 1. Generate AI Response
        // aiService now expects { salonName, services, salonId, senderPhone }
        const aiReply = await generateAIResponse(text, {
            salonName: salon.name,
            services: salon.services,
            salonId: salon.id,
            senderPhone: from
        });

        // 2. Send Response via WhatsApp Cloud API
        await sendWhatsAppMessage(salon.whatsappAPIToken, salon.whatsappPhoneId, from, aiReply);

    } catch (e) {
        console.error('Message Handling Error:', e);
    }
}

async function sendWhatsAppMessage(accessToken, phoneId, to, message) {
    try {
        const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;
        await axios.post(url, {
            messaging_product: 'whatsapp',
            to: to,
            text: { body: message }
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        console.log(`Sent to ${to}: ${message}`);
    } catch (error) {
        console.error('Send Message Error:', error.response?.data || error.message);
    }
}

module.exports = router;
