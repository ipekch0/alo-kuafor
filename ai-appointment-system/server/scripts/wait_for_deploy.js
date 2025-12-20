const axios = require('axios');

const url = "https://odak-manage.onrender.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=my_secure_verify_token_123&hub.challenge=READY";

async function check() {
    process.stdout.write("Checking... ");
    try {
        const res = await axios.get(url);
        if (res.status === 200 && res.data === 'READY') {
            console.log("\n✅ DEPLOYMENT COMPLETE! Server responded correctly.");
            process.exit(0);
        } else {
            console.log(`Status: ${res.status} (Waiting for 200)`);
        }
    } catch (e) {
        if (e.response && e.response.status === 403) {
            console.log("403 Forbidden (Old Code still running...)");
        } else {
            console.log("Error:", e.message);
        }
    }
}

// Check every 5 seconds
console.log("Waiting for Render deployment to finish...");
setInterval(check, 5000);
check();
