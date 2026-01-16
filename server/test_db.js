const prisma = require('./src/lib/prisma');

async function testConnection() {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✓ Database connection OK');
    console.log('Test result:', result);
    process.exit(0);
  } catch (error) {
    console.log('✗ Database connection FAILED');
    console.log('Error:', error.message);
    process.exit(1);
  }
}

testConnection();
