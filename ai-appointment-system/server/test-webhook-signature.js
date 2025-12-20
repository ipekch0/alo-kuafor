const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config({ path: './.env' });

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}/api/whatsapp-cloud/webhook`;
const SECRET = process.env.FACEBOOK_APP_SECRET;

const runTests = async () => {
    console.log('🧪 Testing Webhook Signature Verification...');

    if (!SECRET) {
        console.error('❌ FACEBOOK_APP_SECRET is not set in .env. Cannot run signature tests properly.');
        // We will proceed but expect failure or skip validity test
    }

    // 1. No Signature
    try {
        await axios.post(BASE_URL, { object: 'whatsapp_business_account' });
        console.error('❌ Failed: Handled request without signature (Expected 401)');
    } catch (e) {
        if (e.response?.status === 401) console.log('✅ Passed: Rejected request without signature');
        else console.error('❌ Failed: Unexpected status for no signature:', e.response?.status);
    }

    if (SECRET) {
        // 2. Invalid Signature
        try {
            await axios.post(BASE_URL, { object: 'whatsapp_business_account' }, {
                headers: { 'X-Hub-Signature-256': 'sha256=invalidhash' }
            });
            console.error('❌ Failed: Handled request with invalid signature (Expected 401)');
        } catch (e) {
            if (e.response?.status === 401) console.log('✅ Passed: Rejected request with invalid signature');
            else console.error('❌ Failed: Unexpected status for invalid signature:', e.response?.status);
        }

        // 3. Valid Signature (Message)
        const bodyMsg = {
            object: 'whatsapp_business_account',
            entry: [{ changes: [{ value: { messages: [{ from: '12345', text: { body: 'Test' } }], metadata: { phone_number_id: '123' } } }] }]
        };
        const signatureMsg = crypto.createHmac('sha256', SECRET).update(JSON.stringify(bodyMsg)).digest('hex');

        try {
            await axios.post(BASE_URL, bodyMsg, {
                headers: { 'X-Hub-Signature-256': `sha256=${signatureMsg}` }
            });
            console.log('✅ Passed: Accepted request with valid signature (Message)');
        } catch (e) {
            console.error('❌ Failed: Valid signature request failed:', e.response?.data || e.message);
        }

        // 4. Valid Signature (Status - should trigger 200 without processing)
        const bodyStatus = {
            object: 'whatsapp_business_account',
            entry: [{ changes: [{ value: { statuses: [{ status: 'delivered' }] } }] }]
        };
        const signatureStatus = crypto.createHmac('sha256', SECRET).update(JSON.stringify(bodyStatus)).digest('hex');

        try {
            await axios.post(BASE_URL, bodyStatus, {
                headers: { 'X-Hub-Signature-256': `sha256=${signatureStatus}` }
            });
            console.log('✅ Passed: Accepted status update with 200 OK');
        } catch (e) {
            console.error('❌ Failed: Status update check failed:', e.response?.status);
        }
    }
};

runTests();
