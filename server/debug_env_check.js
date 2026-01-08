require('dotenv').config();

console.log('--- ENV CHECK ---');
console.log('PORT:', process.env.PORT);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('FACEBOOK_APP_ID exists:', !!process.env.FACEBOOK_APP_ID);
console.log('FACEBOOK_APP_SECRET exists:', !!process.env.FACEBOOK_APP_SECRET);
console.log('FACEBOOK_APP_ID length:', process.env.FACEBOOK_APP_ID ? process.env.FACEBOOK_APP_ID.length : 0);
console.log('-----------------');

if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
    console.error('CRITICAL: Facebook keys missing!');
    process.exit(1);
} else {
    console.log('SUCCESS: Keys found.');
}
