const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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

        // Generate Verification Code
        // PRODUCTION: Random 6-digit code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        // const verificationCode = '123456'; // DEMO MODE
        console.log('🔒 VERIFICATION CODE:', verificationCode); // Keep logging for server admin but codes are now random

        // Use transaction to ensure both User and Salon (if applicable) are created
        const result = await prisma.$transaction(async (prisma) => {
            // Create user
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: role || 'customer',
                    isVerified: false,
                    verificationCode: verificationCode
                }
            });

            // If salon owner, create salon
            if (role === 'salon_owner' && salonDetails) {
                await prisma.salon.create({
                    data: {
                        name: salonDetails.salonName,
                        slug: salonDetails.salonName.toLowerCase().replace(/ /g, '-') + '-' + Math.floor(Math.random() * 1000),
                        address: salonDetails.address || '',
                        city: salonDetails.city || '',
                        phone: salonDetails.phone || '',
                        ownerId: user.id,
                        taxNumber: salonDetails.taxNumber,
                        taxOffice: salonDetails.taxOffice,
                        ownerName: name,
                        subscriptionPlan: salonDetails.subscriptionPlan || 'STARTER',
                        isVerified: false
                    }
                });
            }

            return user;
        });

        // Send Verification Email
        try {
            await transporter.sendMail({
                from: `"OdakManage Güvenlik" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'OdakManage Doğrulama Kodunuz',
                text: `Merhaba ${name}, OdakManage'e hoşgeldiniz! Doğrulama kodunuz: ${verificationCode}`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #4F46E5;">OdakManage'e Hoşgeldiniz!</h2>
                        <p>Hesabınızı doğrulamak için lütfen aşağıdaki kodu kullanın:</p>
                        
                        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                            <tr>
                                <td align="center" style="background-color: #F3F4F6; padding: 15px 25px; border-radius: 8px;">
                                    <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #111827; font-family: monospace;">
                                        ${verificationCode}
                                    </span>
                                </td>
                            </tr>
                        </table>

                        <p style="font-size: 14px; color: #666;">Bu kodu siz talep etmediyseniz, lütfen dikkate almayınız.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #999;">Code: ${verificationCode}</p>
                    </div>
                `
            });
            console.log(`✅ Verification email sent to ${email} with code: ${verificationCode}`);
        } catch (emailError) {
            console.error('Email send error (DEMO MODE ENABLED):', emailError.message);
            // DEMO MODE: Continue even if email fails
            console.log(`⚠️ DEMO MODE: Verification Code for ${email} is ${verificationCode}`);
        }

        res.status(201).json({
            message: 'User registered successfully. Please verify your email.',
            requireVerification: true,
            email: result.email
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server error', details: error.message, stack: error.stack });
    }
});

// Verify Email Endpoint
router.post('/verify-email', async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ error: 'Email and code are required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: 'User already verified' });
        }

        if (user.verificationCode !== code) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        // Update user to verified
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationCode: null // Clear code after usage
            }
        });

        // Generate Token immediately after verification so they can login
        const token = jwt.sign(
            { userId: updatedUser.id, email: updatedUser.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        const { password: _, ...userWithoutPassword } = updatedUser;

        res.json({
            message: 'Email verified successfully',
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


// Resend Verification Code
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: 'User already verified' });
        }

        // Generate new verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Update user with new code
        await prisma.user.update({
            where: { id: user.id },
            data: { verificationCode }
        });

        // Send Email
        try {
            await transporter.sendMail({
                from: `"OdakManage Güvenlik" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Yeni Doğrulama Kodunuz',
                text: `Merhaba ${user.name}, yeni doğrulama kodunuz: ${verificationCode}`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #4F46E5;">OdakManage Doğrulama Kodu</h2>
                        <p>Yeni bir doğrulama kodu talep ettiniz. Lütfen aşağıdaki kodu giriniz:</p>
                        <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #111827; display: inline-block; margin: 10px 0;">
                            ${verificationCode}
                        </div>
                    </div>
                `
            });
            console.log(`Resent verification code to ${email}`);
        } catch (emailError) {
            console.error('Email send error:', emailError.message);
            // In production we might want to return 500 here, but for now log it
        }

        res.json({ message: 'Verification code resent successfully' });

    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check verification
        if (!user.isVerified) {
            return res.status(403).json({
                error: 'Email not verified',
                requireVerification: true,
                email: user.email
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

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
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET);
        const { name, phone, avatar } = req.body;

        const user = await prisma.user.update({
            where: { id: decoded.userId },
            data: { name, phone, avatar },
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
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET);

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

// Logout
router.post('/logout', (req, res) => {
    res.json({ message: 'Logout successful' });
});

// ... (existing imports)

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
        }

        // Generate Token
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: token,
                resetPasswordExpires: expires
            }
        });

        // Send Email
        const resetUrl = `${req.headers.origin}/reset-password?token=${token}`;
        const html = `
            <h3>Şifre Sıfırlama</h3>
            <p>Şifrenizi sıfırlamak için aşağıdaki linke tıklayınız:</p>
            <a href="${resetUrl}">Şifremi Sıfırla</a>
            <p>Link 1 saat geçerlidir.</p>
        `;

        await sendEmail(user.email, 'Şifre Sıfırlama Talebi', html);

        res.json({ success: true, message: 'Sıfırlama bağlantısı e-posta adresinize gönderildi.' });

    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ error: 'İşlem başarısız.' });
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { gt: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ error: 'Geçersiz veya süresi dolmuş token.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null
            }
        });

        res.json({ success: true, message: 'Şifreniz başarıyla güncellendi. Giriş yapabilirsiniz.' });

    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ error: 'Sıfırlama işlemi başarısız.' });
    }
});

module.exports = router;
