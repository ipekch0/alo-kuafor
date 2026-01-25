const axios = require('axios');

async function debugAuthMe() {
    let token;
    try {
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'demo_admin@alokuafor.com',
            password: '123456'
        });
        token = loginRes.data.token;
        console.log('✅ Logged in. Token:', token.substring(0, 20) + '...');
    } catch (e) {
        console.error('❌ Login Failed', e.message);
        return;
    }

    try {
        console.log('Fetching /api/auth/me ...');
        const res = await axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ /api/auth/me: Success', res.data.user.email);
    } catch (error) {
        console.error('❌ /api/auth/me: FAILED', error.response ? error.response.status : error.message);
        if (error.response) console.error(error.response.data);
    }
}

debugAuthMe();
