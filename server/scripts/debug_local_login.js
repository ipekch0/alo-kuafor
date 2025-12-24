const axios = require('axios');

async function testLogin() {
    try {
        console.log('Testing Login Endpoint...');
        const response = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'yipek8055@gmail.com',
            password: 'wrongpassword' // Just testing response format
        });
        console.log('Response Status:', response.status);
        console.log('Response Data:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('Error Status:', error.response.status);
            console.log('Error Data:', error.response.data);
            console.log('Error Headers:', error.response.headers);
        } else {
            console.error('Network/Server Error:', error.message);
        }
    }
}

testLogin();
