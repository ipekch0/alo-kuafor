const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const authenticateToken = require('../middleware/auth');

// Multer Config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'salon-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Not an image! Please upload an image.'), false);
        }
    }
});

// GET /api/salons/mine - Get Current User's Salon
router.get('/mine', authenticateToken, async (req, res) => {
    try {
        const salon = await prisma.salon.findFirst({
            where: { ownerId: req.user.id },
            include: {
                services: true,
                professionals: true
            }
        });

        if (!salon) {
            // If no salon exists, return null (frontend should handle this, maybe show create form)
            return res.json(null);
        }

        res.json(salon);
    } catch (error) {
        console.error('Get My Salon Error:', error);
        res.status(500).json({ error: 'Sunucu hatası.' });
    }
});

// PUT /api/salons/mine - Update Current User's Salon
router.put('/mine', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        console.log('PUT /mine request received');
        console.log('req.file:', req.file);
        console.log('req.body:', req.body);

        const { name, description, address, city, district, phone } = req.body;
        let { workingHours } = req.body;

        if (typeof workingHours === 'string') {
            try { workingHours = JSON.parse(workingHours); } catch (e) { workingHours = null; }
        }

        // Check if salon exists
        const existingSalon = await prisma.salon.findFirst({
            where: { ownerId: req.user.id }
        });

        const dataToUpdate = {
            name,
            description,
            address,
            city,
            district,
            phone,
            workingHours: workingHours ? JSON.stringify(workingHours) : undefined
        };

        // Handle Image Upload
        if (req.file) {
            const protocol = req.protocol;
            const host = req.get('host');
            dataToUpdate.image = `${protocol}://${host}/uploads/${req.file.filename}`;
        }

        // Remove undefined keys
        Object.keys(dataToUpdate).forEach(key => dataToUpdate[key] === undefined && delete dataToUpdate[key]);

        let salon;

        if (existingSalon) {
            // Update
            salon = await prisma.salon.update({
                where: { id: existingSalon.id },
                data: dataToUpdate
            });
        } else {
            // Create
            salon = await prisma.salon.create({
                data: {
                    ...dataToUpdate,
                    ownerId: req.user.id,
                    slug: (name || 'salon').toLowerCase().replace(/ /g, '-') + '-' + Math.floor(Math.random() * 1000)
                }
            });
        }

        res.json(salon);
    } catch (error) {
        console.error('Update Salon Error:', error);
        res.status(500).json({ error: 'Güncelleme sırasında bir hata oluştu.' });
    }
});

// GET /api/salons/search - Advanced Search
router.get('/search', async (req, res) => {
    try {
        const { query, city, district, minPrice, maxPrice, serviceCategory } = req.query;

        const where = {
            // isContracted: true // Removed restricted filter to allow all salons
        };

        // Text Search (Name or Description)
        if (query) {
            where.OR = [
                { name: { contains: query } },
                { description: { contains: query } }
            ];
        }

        // Location Filter
        if (city) where.city = city;
        if (district) where.district = district;

        // Service & Price Filter
        if (serviceCategory || minPrice || maxPrice) {
            const priceFilter = {};
            if (minPrice && !isNaN(parseFloat(minPrice))) {
                priceFilter.gte = parseFloat(minPrice);
            }
            if (maxPrice && !isNaN(parseFloat(maxPrice))) {
                priceFilter.lte = parseFloat(maxPrice);
            }

            where.services = {
                some: {
                    active: true,
                    ...(serviceCategory && { category: serviceCategory }),
                    ...(Object.keys(priceFilter).length > 0 && { price: priceFilter })
                }
            };
        }

        const salons = await prisma.salon.findMany({
            where,
            include: {
                services: {
                    where: { active: true },
                    take: 3 // Preview 3 services
                },
                professionals: {
                    where: { active: true },
                    take: 3 // Preview 3 professionals
                }
            },
            orderBy: {
                rating: 'desc'
            }
        });

        res.json(salons);
    } catch (error) {
        console.error('Search Error:', error);
        res.status(500).json({ error: 'Arama sırasında bir hata oluştu.', details: error.message, stack: error.stack });
    }
});

// GET /api/salons/:id - Get Salon Details
router.get('/:id', async (req, res) => {
    try {
        const salon = await prisma.salon.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                services: { where: { active: true } },
                professionals: { where: { active: true } },
                owner: { select: { name: true, email: true } }
            }
        });

        if (!salon) {
            return res.status(404).json({ error: 'Salon bulunamadı.' });
        }

        res.json(salon);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/salons/upgrade - Upgrade Subscription Plan
router.post('/upgrade', authenticateToken, async (req, res) => {
    try {
        const { plan } = req.body;

        if (!plan) {
            return res.status(400).json({ error: 'Plan belirtilmedi.' });
        }

        const salon = await prisma.salon.findFirst({
            where: { ownerId: req.user.id }
        });

        if (!salon) {
            return res.status(404).json({ error: 'Salon bulunamadı.' });
        }

        const updatedSalon = await prisma.salon.update({
            where: { id: salon.id },
            data: { subscriptionPlan: plan }
        });

        res.json({ success: true, salon: updatedSalon });
    } catch (error) {
        console.error('Upgrade Error:', error);
        res.status(500).json({ error: 'Paket yükseltme sırasında bir hata oluştu.' });
    }
});

module.exports = router;
