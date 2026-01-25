const http = require('http');

http.get('http://127.0.0.1:4040/api/tunnels', (resp) => {
    let data = '';

    // A chunk of data has been received.
    resp.on('data', (chunk) => {
        data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            const tunnel = parsed.tunnels.find(t => t.proto === 'https');
            if (tunnel) {
                console.log('NGROK_URL=' + tunnel.public_url);
            } else {
                console.log('No HTTPS tunnel found');
            }
        } catch (e) {
            console.error('Error parsing JSON:', e.message);
        }
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});
