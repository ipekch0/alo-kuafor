const axios = require('axios');
const fs = require('fs');

const TOKEN = 'EAAZAZAMaAliCIBQLZCXjJUIONAhvJUxJAwZAn5l9b9yWP3GR4N3S2s0sxrV1Cdim1ZBU5sBAn6XBq35RZA0Q0kFK07DHikAlvtx8XYue1KIQgRcJA7idLSFGOsvZBxxgMSIIbAKqMZCarwMR1NMQFlY2n8bCT3enZCid2v3a7wUOksVxw8ZBgzta6M3b2RZCWoQaTdjc6v8M1A2yLaDs8TmeXyc0eVvvjxcVCnz23NFQzrjAMyFiCDeL80kuqMuyyhMz4ZCRZAve195hs4Utqjihtak7f';
const ID = '553313931201502';

async function test() {
    console.log('Testing...');
    try {
        const url = `https://graph.facebook.com/v17.0/${ID}/messages`;
        const res = await axios.post(url, {
            messaging_product: 'whatsapp',
            to: '905551234567',
            text: { body: 'Hardcoded Test' }
        }, {
            headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }
        });
        console.log('SUCCESS:', res.data);
    } catch (error) {
        console.log('FAILURE');
        if (error.response) {
            fs.writeFileSync('error.json', JSON.stringify(error.response.data, null, 2));
            console.log('Error logged to error.json');
        } else {
            console.log(error.message);
        }
    }
}
test();
