const axios = require('axios');

async function debugAI() {
    let token;
    try {
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'demo_admin@alokuafor.com',
            password: '123456'
        });
        token = loginRes.data.token;
    } catch (e) {
        console.error('Login failed', e.message);
        return;
    }

    try {
        console.log('Fetching /api/ai/history ...'); // Assuming history endpoint exists?
        // Or if it just inits.
        // Let's check status
        console.log('Fetching /api/ai/status ...');
        const res = await axios.get('http://localhost:5000/api/ai/status', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ AI Status:', res.status, res.data);
    } catch (error) {
        console.error('❌ AI Failed:', error.message);
        if (error.response) console.error(error.response.data);
    }
}

debugAI();
