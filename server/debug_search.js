const axios = require('axios');

async function debugSearch() {
    try {
        const url = 'http://localhost:5000/api/salons/search?query=&maxPrice=1';
        console.log(`Fetching ${url}...`);
        const response = await axios.get(url);
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Response:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Fetch error:', error.message);
        }
    }
}

debugSearch();
