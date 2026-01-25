const axios = require('axios');

async function testLogin() {
    try {
        console.log('Attempting login...');
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'demo_admin@alokuafor.com',
            password: '123456'
        });
        console.log('✅ Login Success:', response.data);
    } catch (error) {
        if (error.response) {
            console.error('❌ Login Failed:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('❌ No Response Received (Server might be down or not sending response)');
        } else {
            console.error('❌ Error:', error.message);
        }
    }
}

testLogin();
