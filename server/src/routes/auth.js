const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

const router = express.Router();
const prisma = require('../lib/prisma');

// Fallback for JWT_SECRET to prevent crash
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_debugging_only';
const JWT_EXPIRES_IN = '7d';

const { sendSMS } = require('../services/smsService');
const validateRequest = require('../middleware/validation');
const { registerSchema, loginSchema } = require('../utils/schemas');

// Register new user
router.post('/register', validateRequest(registerSchema), async (req, res) => {
    try {
        const { name, email, password, phone, role, salonDetails } = req.body;

        // Validate input
        if (!name || !email || !password || !phone) {
            return res.status(400).json({ error: 'Ad, Email, Şifre ve Telefon zorunludur.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Şifre en az 6 karakter olmalıdır.' });
        }

        // Additional validation for salon owners
        if (role === 'salon_owner') {
            if (!salonDetails || !salonDetails.salonName || !salonDetails.taxNumber || !salonDetails.taxOffice) {
                return res.status(400).json({ error: 'İşletme adı, vergi numarası ve vergi dairesi zorunludur.' });
            }
        }

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { phone: phone } // Check phone uniqueness too
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Bu email veya telefon numarası zaten kayıtlı.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate Verification Code (Crypto Secure)
        const verificationCode = crypto.randomInt(100000, 999999).toString();

        // Send (Email) Verification Code
        console.log(`🔒 EMAIL OTP for ${email}:`, verificationCode);

        // Send Email
        try {
            const subject = 'OdakManage Doğrulama Kodunuz';
            const html = `
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
                </div>
            `;
            await sendEmail(email, subject, html);
            console.log(`✅ Verification email sent to ${email}`);
        } catch (emailError) {
            console.error('Email send error:', emailError.message);
        }

        // SMS Logic (DISABLED by User Request)
        /*
        try {
            await sendSMS(phone, `OdakManage Dogrulama Kodunuz: ${verificationCode}`);
        } catch (smsError) {
            console.error('SMS Send Failed:', smsError.message);
        }
        */

        // Use transaction to ensure both User and Salon (if applicable) are created
        const result = await prisma.$transaction(async (prisma) => {
            // Create user
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    phone, // Still saving phone, useful for future
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
                        phone: salonDetails.phone || phone,
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


        res.status(201).json({
            message: 'Kayıt başarılı. Lütfen E-Posta adresinize gelen kodu giriniz.',
            requireVerification: true,
            email: result.email,
            phone: result.phone,
            debugCode: verificationCode
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Verify SMS OTP (Replaces or Augments Email Verify)
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, code } = req.body; // Identifying user by email during verify flow

        if (!email || !code) {
            return res.status(400).json({ error: 'Email ve Kod zorunludur.' });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: 'Kullanıcı zaten doğrulanmış.' });
        }

        if (user.verificationCode !== code) {
            return res.status(400).json({ error: 'Geçersiz doğrulama kodu.' });
        }

        // Update user to verified
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                isVerified: true,
                verificationCode: null,
            }
        });

        // Send Welcome Email
        try {
            const isSalon = updatedUser.role === 'salon_owner';
            const welcomeSubject = isSalon
                ? 'OdakManage Ailesine Hoşgeldiniz! ✂️'
                : 'OdakManage\'e Hoşgeldiniz! ✨';

            const welcomeHtml = isSalon ? `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4F46E5;">Tebrikler ${updatedUser.name}!</h2>
                    <p>Salonunuz için OdakManage dünyasına ilk adımı attınız. İşletmenizi büyütmek ve randevularınızı yapay zeka ile yönetmek için sabırsızlanıyoruz.</p>
                    <p><b>Sıradaki Adımlar:</b></p>
                    <ul>
                        <li>İşletme profilinizi tamamlayın.</li>
                        <li>Hizmetlerinizi ve personelinizi ekleyin.</li>
                        <li>Yapay zeka asistanınızı yapılandırın.</li>
                    </ul>
                    <a href="${req.headers.origin}/panel" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">Paneli Görüntüle</a>
                </div>
            ` : `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #4F46E5;">Hoşgeldiniz ${updatedUser.name}!</h2>
                    <p>OdakManage ile en iyi kuaförlerden kolayca randevu alabilir ve stilinizi yönetebilirsiniz.</p>
                    <p>Hemen keşfetmeye başlayın!</p>
                    <a href="${req.headers.origin}/search" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">Salon Ara</a>
                </div>
            `;

            await sendEmail(updatedUser.email, welcomeSubject, welcomeHtml);
            console.log(`📧 Welcome email sent to ${updatedUser.email}`);
        } catch (emailError) {
            console.error('Welcome Email Error:', emailError.message);
        }

        // Generate Token
        const token = jwt.sign(
            { userId: updatedUser.id, email: updatedUser.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        const { password: _, ...userWithoutPassword } = updatedUser;

        res.json({
            message: 'Telefon doğrulandı, giriş yapıldı.',
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Doğrulama hatası.' });
    }
});

// Old verify-email redirect or keep specific if needed
router.post('/verify-email', async (req, res) => {
    // Alias to verify-otp for backward compatibility or dual use
    // ... same logic
    return res.status(400).json({ error: 'Please use /verify-otp for new flow.' });
});

// Resend SMS Code
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email gerekli.' });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
        }

        if (user.isVerified) {
            return res.status(400).json({ error: 'Zaten doğrulanmış.' });
        }

        // Generate new code
        const verificationCode = crypto.randomInt(100000, 999999).toString();

        await prisma.user.update({
            where: { id: user.id },
            data: { verificationCode }
        });

        // Send SMS
        if (user.phone) {
            console.log(`🔒 Resend SMS OTP for ${user.phone}:`, verificationCode);
            try {
                await sendSMS(user.phone, `OdakManage Yeni Kodunuz: ${verificationCode}`);
            } catch (e) { console.error(e); }
        }

        res.json({
            message: 'Kod tekrar gönderildi.',
            debugCode: verificationCode
        });

    } catch (error) {
        console.error('Resend error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login user
router.post('/login', validateRequest(loginSchema), async (req, res) => {
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
        res.status(500).json({ error: 'Server error', details: error.message, stack: error.stack });
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
        const { name, phone, avatar, location } = req.body;

        const user = await prisma.user.update({
            where: { id: decoded.userId },
            data: { name, phone, avatar, location },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                avatar: true,
                location: true,
                createdAt: true,
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
