const axios = require('axios');

const TOKEN = 'EAAZAZAMaAliCIBQLZCXjJUIONAhvJUxJAwZAn5l9b9yWP3GR4N3S2s0sxrV1Cdim1ZBU5sBAn6XBq35RZA0Q0kFK07DHikAlvtx8XYue1KIQgRcJA7idLSFGOsvZBxxgMSIIbAKqMZCarwMR1NMQFlY2n8bCT3enZCid2v3a7wUOksVxw8ZBgzta6M3b2RZCWoQaTdjc6v8M1A2yLaDs8TmeXyc0eVvvjxcVCnz23NFQzrjAMyFiCDeL80kuqMuyyhMz4ZCRZAve195hs4Utqjihtak7f';

async function checkMe() {
    console.log('Checking /me ...');
    try {
        const res = await axios.get(`https://graph.facebook.com/v17.0/me?fields=id,name&access_token=${TOKEN}`);
        console.log('ME:', res.data);
    } catch (error) {
        console.log('ME Error:', error.response ? error.response.data : error.message);
    }
}
checkMe();
