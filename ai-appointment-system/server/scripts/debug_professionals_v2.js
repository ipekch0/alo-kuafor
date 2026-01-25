const axios = require('axios');

async function debugProfessionals() {
    try {
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'demo_admin@alokuafor.com',
            password: '123456'
        });
        const token = loginRes.data.token;
        console.log('✅ Logged in.');

        console.log('Fetching /api/professionals ...');
        const response = await axios.get('http://localhost:5000/api/professionals', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Success:', response.data.length, 'professionals found.');
    } catch (error) {
        if (error.response) {
            console.error('❌ Failed:', error.response.status, error.response.data);
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

debugProfessionals();
