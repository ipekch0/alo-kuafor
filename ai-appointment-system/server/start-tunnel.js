const localtunnel = require('localtunnel');

(async () => {
    console.log('Starting tunnel...');
    try {
        const tunnel = await localtunnel({ port: 5000 });
        console.log('Tunnel URL:', tunnel.url);

        tunnel.on('close', () => {
            console.log('Tunnel closed');
        });

        // Keep alive
        process.stdin.resume();
    } catch (err) {
        console.error('Tunnel error:', err);
    }
})();
