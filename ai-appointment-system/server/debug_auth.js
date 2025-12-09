const axios = require('axios');

async function debugRegister() {
    try {
        const uniqueSuffix = Math.floor(Math.random() * 100000);
        const user = {
            name: `Test User ${uniqueSuffix}`,
            email: `test${uniqueSuffix}@example.com`,
            password: 'password123',
            role: 'customer'
        };

        console.log(`Registering user: ${user.email}...`);
        const response = await axios.post('http://localhost:5000/api/auth/register', user);
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error Message:', error.response.data.details);
        } else {
            console.error('Fetch error:', error.message);
        }
    }
}

debugRegister();
