const axios = require('axios');
const API_URL = 'http://localhost:5000/api';

async function testAI() {
    try {
        console.log('--- Testing AI Chat ---');
        const chatRes = await axios.post(`${API_URL}/ai/chat`, {
            message: 'Saç kesimi fiyatları ne kadar?'
        });
        console.log('Chat Response:', chatRes.data);

        console.log('\n--- Testing AI Image Gen (Blonde) ---');
        const imgRes1 = await axios.post(`${API_URL}/ai/generate-image`, {
            prompt: 'modern blonde bob hair style'
        });
        console.log('Blonde Image:', imgRes1.data);

        console.log('\n--- Testing AI Image Gen (Man) ---');
        const imgRes2 = await axios.post(`${API_URL}/ai/generate-image`, {
            prompt: 'men fade haircut'
        });
        console.log('Man Image:', imgRes2.data);

        console.log('\n--- Testing AI Status ---');
        const statusRes = await axios.get(`${API_URL}/ai/status`);
        console.log('Status:', statusRes.data);

    } catch (error) {
        console.error('Test Failed:', error.response?.data || error.message);
    }
}

testAI();
