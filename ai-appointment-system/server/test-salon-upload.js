const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function testUpload() {
    try {
        // 1. Find the user
        const user = await prisma.user.findUnique({
            where: { email: 'yipek8055@gmail.com' }
        });

        if (!user) {
            console.error('User not found!');
            return;
        }

        console.log('User found:', user.email, 'ID:', user.id);

        // 2. Generate Token
        // Must match auth.js payload: { userId: user.id, email: user.email }
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        console.log('Token generated.');

        // 3. Prepare Form Data
        const formData = new FormData();
        formData.append('name', 'Test Salon Update ' + Date.now());

        // Create a dummy file blob
        const fileContent = 'fake image content';
        const blob = new Blob([fileContent], { type: 'image/png' });
        formData.append('image', blob, 'test-logo.png');

        console.log('Sending PUT request to http://localhost:5000/api/salons/mine...');

        // 4. Send Request
        const response = await fetch('http://localhost:5000/api/salons/mine', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
                // Note: Content-Type is NOT set manually, fetch sets it with boundary
            },
            body: formData
        });

        const text = await response.text();
        console.log('Response Status:', response.status);
        console.log('Response Body:', text);

    } catch (error) {
        console.error('Test Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testUpload();
