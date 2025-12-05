const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, salonDetails } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Additional validation for salon owners
        if (role === 'salon_owner') {
            if (!salonDetails || !salonDetails.salonName || !salonDetails.taxNumber || !salonDetails.taxOffice) {
                return res.status(400).json({ error: 'İşletme adı, vergi numarası ve vergi dairesi zorunludur.' });
            }
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Use transaction to ensure both User and Salon (if applicable) are created
        const result = await prisma.$transaction(async (prisma) => {
            // Create user
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: role || 'customer' // Default to customer
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true
                }
            });

            // If salon owner, create salon
            if (role === 'salon_owner' && salonDetails) {
                await prisma.salon.create({
                    data: {
                        name: salonDetails.salonName,
                        slug: salonDetails.salonName.toLowerCase().replace(/ /g, '-') + '-' + Math.floor(Math.random() * 1000), // Simple slug gen
                        address: salonDetails.address || '',
                        city: salonDetails.city || '',
                        phone: salonDetails.phone || '',
                        ownerId: user.id,
                        taxNumber: salonDetails.taxNumber,
                        taxOffice: salonDetails.taxOffice,
                        ownerName: name,
                        isVerified: false // Default to false until admin approval or auto-check
                    }
                });
            }

            return user;
        });

        // Generate JWT token
        const token = jwt.sign(
            { userId: result.id, email: result.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: result
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            message: 'Login successful',
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update current user profile
router.put('/me', async (req, res) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7);

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        const { name, phone, avatar } = req.body;

        // Update user
        const user = await prisma.user.update({
            where: { id: decoded.userId },
            data: {
                name,
                phone,
                avatar
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                avatar: true,
                createdAt: true,
                updatedAt: true
            }
        });

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get current user (requires authentication)
router.get('/me', async (req, res) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7);

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Get user
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                avatar: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Logout (client-side token removal, optional endpoint)
router.post('/logout', (req, res) => {
    // Since we're using stateless JWT, logout is handled on client-side
    // This endpoint is optional and can be used for logging/analytics
    res.json({ message: 'Logout successful' });
});

module.exports = router;
