const axios = require('axios');

async function debugSalonsMe() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'demo_admin@alokuafor.com',
            password: '123456'
        });
        const token = loginRes.data.token;
        console.log('✅ Logged in.');

        // 2. Fetch My Salon
        console.log('Fetching /api/salons/mine ...');
        const response = await axios.get('http://localhost:5000/api/salons/mine', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Success:', response.data);
    } catch (error) {
        if (error.response) {
            console.error('❌ Failed:', error.response.status, error.response.data);
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

debugSalonsMe();
