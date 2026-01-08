require('dotenv').config();

console.log('--- JWT CHECK ---');
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
// Don't print the actual secret for security, just check if it looks valid
console.log('-----------------');
