const fs = require('fs');
const path = require('path');

try {
    const envPath = path.join('server', '.env');
    const content = fs.readFileSync(envPath, 'utf8');
    const dbLine = content.split('\n').find(l => l.startsWith('DATABASE_URL=')); // Find line starting with DATABASE_URL

    if (dbLine) {
        // Extract the value part after the first '='
        let url = dbLine.substring(dbLine.indexOf('=') + 1).trim();
        // Remove quotes if present
        url = url.replace(/^['"]|['"]$/g, '');

        // Construct DIRECT_URL: Port 6543 -> 5432, remove pgbouncer param
        const directUrl = url.replace(':6543', ':5432').replace('?pgbouncer=true', '').replace('&pgbouncer=true', '');

        fs.writeFileSync('urls.txt', `DATABASE_URL=${url}\nDIRECT_URL=${directUrl}`);
        console.log('URLs extract success');
    } else {
        fs.writeFileSync('urls.txt', 'DATABASE_URL_NOT_FOUND');
    }
} catch (e) {
    fs.writeFileSync('urls.txt', 'ERROR: ' + e.message);
}
