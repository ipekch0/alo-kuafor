try {
    console.log('Checking express...');
    require('express');
    console.log('Checking cors...');
    require('cors');
    console.log('Checking @prisma/client...');
    const { PrismaClient } = require('@prisma/client');
    new PrismaClient();
    console.log('All good!');
} catch (e) {
    console.error('Import failed:', e);
}
