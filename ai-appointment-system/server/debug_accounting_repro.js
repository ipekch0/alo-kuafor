const axios = require('axios');

async function debugAccounting() {
    try {
        // 1. Login to get token
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'yipek8055@gmail.com',
            password: '123456'
        });
        const token = loginRes.data.token;
        console.log('Got token:', token ? 'Yes' : 'No');

        // 2. Call Stats Verify
        console.log('Calling /api/accounting/stats...');
        const statsRes = await axios.get('http://localhost:5000/api/accounting/stats', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Stats Response Status:', statsRes.status);
        console.log('Stats Data:', statsRes.data);

    } catch (error) {
        console.error('Error occurred!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

debugAccounting();
