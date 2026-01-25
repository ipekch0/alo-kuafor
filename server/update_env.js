const fs = require('fs');
const content = `DATABASE_URL='postgresql://postgres.ggxdspkgfhbikorxlcpt:Baystbay5269@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true'

JWT_SECRET='super-secret-key-change-this'

PORT=5000

CLIENT_URL='http://localhost:5173'
`;
fs.writeFileSync('.env', content);
console.log('Successfully updated .env');
