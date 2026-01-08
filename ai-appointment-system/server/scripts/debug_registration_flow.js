const axios = require('axios');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const API_URL = 'http://localhost:5000/api';

// Random string for unique user
const rand = Math.floor(Math.random() * 100000);
const email = `gold${rand}@salon.com`;
const password = 'password123';

async function testPaidRegistrationFlow() {
    try {
        console.log(`\n--- 1. Registering New Salon Owner (${email}) ---`);
        const registerData = {
            name: 'Gold User Test',
            email: email,
            password: password,
            role: 'salon_owner',
            salonDetails: {
                salonName: `Gold Salon ${rand}`,
                phone: `0555${rand.toString().padStart(7, '0')}`,
                city: 'İstanbul',
                district: 'Kadıköy',
                taxNumber: '1234567890',
                taxOffice: 'Kadıköy',
                address: 'Test Address'
            }
        };

        const regRes = await axios.post(`${API_URL}/auth/register`, registerData);
        console.log('Registration Status:', regRes.status);
        console.log('Registration Response:', regRes.data);

        // --- 2. Get Verification Code (Simulate Check Email) ---
        console.log('\n--- 2. Fetching Verification Code from DB ---');
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) throw new Error('User not found in DB');
        console.log('Verification Code:', user.verificationCode);

        // --- 3. Verify Email to get Token ---
        console.log('\n--- 3. Verifying Email ---');
        const verifyRes = await axios.post(`${API_URL}/auth/verify-email`, {
            email: email,
            code: user.verificationCode
        });

        const { token } = verifyRes.data;
        console.log('Verification Successful. Token received.');

        if (!token) throw new Error('No token returned after verification');

        // --- 4. Simulate Payment & Upgrade to GOLD ---
        console.log('\n--- 4. Simulating Payment & Upgrade to GOLD ---');
        const upgradeRes = await axios.post(
            `${API_URL}/salons/upgrade`,
            { plan: 'GOLD' },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('Upgrade Response:', upgradeRes.data);

        if (upgradeRes.data.success && upgradeRes.data.salon.subscriptionPlan === 'GOLD') {
            console.log('\n✅ PASS: Salon plan successfully upgraded to GOLD.');
        } else {
            console.log('\n❌ FAIL: Plan did not update correctly.');
        }

    } catch (error) {
        if (error.response) {
            console.error('API Error Status:', error.response.status);
            console.error('API Error Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('No Response Received by Axios:', error.code || error.message);
        } else {
            console.error('Script Error:', error.message);
            console.error(error.stack);
        }
    } finally {
        await prisma.$disconnect();
    }
}

testPaidRegistrationFlow();
