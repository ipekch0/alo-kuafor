const axios = require('axios');

async function debugDashboard() {
    let token;
    try {
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'demo_admin@alokuafor.com',
            password: '123456'
        });
        token = loginRes.data.token;
        console.log('✅ Logged in.');
    } catch (e) {
        console.error('❌ Login Failed', e.message);
        return;
    }

    const endpoints = [
        '/api/salons/mine',
        '/api/appointments',
        '/api/customers',
        '/api/services',
        '/api/professionals'
    ];

    for (const ep of endpoints) {
        try {
            console.log(`Fetching ${ep} ...`);
            const res = await axios.get(`http://localhost:5000${ep}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`✅ ${ep}: Success (${Array.isArray(res.data) ? res.data.length + ' items' : 'Object'})`);
        } catch (error) {
            console.error(`❌ ${ep}: FAILED ${error.response ? error.response.status : error.message}`);
            if (error.response && error.response.data) {
                console.error('   Details:', error.response.data);
            }
        }
    }
}

debugDashboard();
