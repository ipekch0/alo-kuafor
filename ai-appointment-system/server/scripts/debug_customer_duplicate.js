const axios = require('axios');
const API_URL = 'http://localhost:5000/api';

async function testCustomerDuplicate() {
    try {
        console.log('--- Logging in ---');
        // Login as admin/owner
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@admin.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Login successful');

        const headers = { Authorization: 'Bearer ' + token };
        const phone = '05559998877'; // Unique test phone

        console.log('\n--- Creating Customer (First Time) ---');
        try {
            await axios.post(`${API_URL}/customers`, {
                name: 'Duplicate Test User',
                phone: phone,
                email: 'dup@test.com'
            }, { headers });
            console.log('First creation: Success');
        } catch (err) {
            console.log('First creation status:', err.response?.status);
            if (err.response?.status === 400 && err.response?.data?.error?.includes('zaten var')) {
                console.log('Customer already existed, proceeding to duplicate test...');
            } else if (err.response?.status === 200) {
                console.log('Customer already existed (handled), proceeding...');
            } else {
                throw err;
            }
        }

        console.log('\n--- Creating Customer (Second Time - Duplicate) ---');
        const dupRes = await axios.post(`${API_URL}/customers`, {
            name: 'Duplicate Test User 2',
            phone: phone, // SAME PHONE
            email: 'dup2@test.com'
        }, { headers });

        console.log('Second creation status:', dupRes.status);
        console.log('Response data:', dupRes.data);

        if (dupRes.status === 200 && dupRes.data.message?.includes('zaten kayıtlı')) {
            console.log('PASS: Duplicate handled gracefully.');
        } else {
            console.log('FAIL: Unexpected response.');
        }

        // Cleanup
        // We can leave it for now or delete if we had the ID.
        // const id = dupRes.data.id;
        // await axios.delete(`${API_URL}/customers/${id}`, { headers });

    } catch (error) {
        console.error('Test Failed:', error.response?.data || error.message);
    }
}

testCustomerDuplicate();
