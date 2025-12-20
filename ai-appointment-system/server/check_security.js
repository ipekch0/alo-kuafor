const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
    console.log('🛡️  Starting Security Checks...\n');

    // 1. Zod Validation Check
    try {
        console.log('1️⃣  Testing Input Validation (Login)...');
        await axios.post(`${BASE_URL}/auth/login`, {
            email: 'invalid-email', // Invalid email format
            password: '123'
        });
        console.error('❌ Failed: Server accepted invalid email!');
    } catch (e) {
        if (e.response && e.response.status === 400) {
            console.log('✅ Passed: Invalid email rejected (400 Bad Request)');
            // console.log('   Response:', e.response.data);
        } else {
            console.error('❌ Failed: Unexpected status for invalid input:', e.response?.status);
        }
    }

    // 2. Rate Limiting Check
    console.log('\n2️⃣  Testing Rate Limiting (Auth)...');
    let blocked = false;
    for (let i = 0; i < 15; i++) {
        try {
            await axios.post(`${BASE_URL}/auth/login`, {
                email: 'test@example.com',
                password: 'password123'
            });
            process.stdout.write('.');
        } catch (e) {
            if (e.response && e.response.status === 429) {
                console.log('\n✅ Passed: Rate limit triggered (429 Too Many Requests)');
                blocked = true;
                break;
            }
        }
    }
    if (!blocked) console.error('\n❌ Failed: Rate limit NOT triggered after 15 requests!');

    // 3. Helmet Headers Check
    console.log('\n3️⃣  Testing Security Headers...');
    try {
        const res = await axios.get(`${BASE_URL}/health`);
        const headers = res.headers;
        if (headers['x-dns-prefetch-control'] === 'off' && headers['x-frame-options'] === 'SAMEORIGIN') {
            console.log('✅ Passed: Helmet headers found (X-DNS-Prefetch-Control, X-Frame-Options)');
        } else {
            console.log('⚠️  Warning: Some Helmet headers might be missing or different.');
            // console.log(headers);
        }
    } catch (e) {
        console.error('❌ Failed to check headers:', e.message);
    }
};

runTests();
