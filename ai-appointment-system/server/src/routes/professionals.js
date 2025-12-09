const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { checkSubscriptionLimit } = require('../utils/subscription');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const prisma = new PrismaClient();

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
        cb(null, 'pro-' + uniqueSuffix + path.extname(file.originalname));
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

// Apply auth middleware
router.use(authMiddleware);

// GET all professionals
router.get('/', async (req, res) => {
    try {
        const salon = await prisma.salon.findFirst({
            where: { ownerId: req.user.id }
        });

        if (!salon) return res.json([]);

        const professionals = await prisma.professional.findMany({
            where: {
                salonId: salon.id,
                active: true
            },
            include: {
                _count: { select: { appointments: true } }
            }
        });

        const formatted = professionals.map(pro => ({
            ...pro,
            specialties: pro.specialties ? JSON.parse(pro.specialties) : [],
            workingHours: pro.workingHours ? JSON.parse(pro.workingHours) : {}
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET single professional
router.get('/:id', async (req, res) => {
    try {
        const professional = await prisma.professional.findUnique({
            where: { id: parseInt(req.params.id) }
        });
        if (!professional) return res.status(404).json({ error: 'Professional not found' });

        res.json({
            ...professional,
            specialties: professional.specialties ? JSON.parse(professional.specialties) : [],
            workingHours: professional.workingHours ? JSON.parse(professional.workingHours) : {}
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE professional
router.delete('/:id', async (req, res) => {
    try {
        await prisma.professional.update({
            where: { id: parseInt(req.params.id) },
            data: { active: false }
        });
        res.json({ message: 'Professional deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST create professional
router.post('/', upload.single('photo'), async (req, res) => {
    try {
        // Parse body because FormData sends everything as strings
        const { name, title, bio } = req.body;
        let { specialties, workingHours } = req.body;

        // Handle arrays/objects from FormData string
        if (typeof specialties === 'string') {
            try { specialties = JSON.parse(specialties); } catch (e) { specialties = []; }
        }
        if (typeof workingHours === 'string') {
            try { workingHours = JSON.parse(workingHours); } catch (e) { workingHours = null; }
        }

        // Handle Photo
        let photoUrl = req.body.photoUrl || ''; // Fallback for URL string if used
        if (req.file) {
            // Construct accessible URL. Assuming server runs on port 5000 and client on 3000, 
            // usually we store relative path or full URL.
            // Storing full URL for simplicity with current setup, or relative path '/uploads/...'
            const protocol = req.protocol;
            const host = req.get('host');
            photoUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
        }

        const salon = await prisma.salon.findFirst({
            where: { ownerId: req.user.id }
        });

        if (!salon) return res.status(400).json({ error: 'Salon not found.' });

        const canAdd = await checkSubscriptionLimit(salon.id, 'professional');
        if (!canAdd) {
            return res.status(403).json({
                error: 'Paket limiti aşıldı. Yeni personel eklemek için paketinizi yükseltin.',
                code: 'LIMIT_REACHED'
            });
        }

        const professional = await prisma.professional.create({
            data: {
                salonId: salon.id,
                name,
                title,
                bio,
                photo: photoUrl,
                specialties: specialties ? JSON.stringify(specialties) : '[]',
                workingHours: workingHours ? JSON.stringify(workingHours) : JSON.stringify({
                    monday: { start: '09:00', end: '19:00' },
                    tuesday: { start: '09:00', end: '19:00' },
                    wednesday: { start: '09:00', end: '19:00' },
                    thursday: { start: '09:00', end: '19:00' },
                    friday: { start: '09:00', end: '19:00' },
                    saturday: { start: '09:00', end: '19:00' },
                    sunday: { closed: true }
                })
            }
        });

        res.status(201).json({
            ...professional,
            specialties: JSON.parse(professional.specialties),
            workingHours: JSON.parse(professional.workingHours)
        });
    } catch (error) {
        console.error('Create pro error:', error);
        res.status(400).json({ error: error.message });
    }
});

// PUT update professional
router.put('/:id', upload.single('photo'), async (req, res) => {
    try {
        const { name, title, bio } = req.body;
        let { specialties, workingHours } = req.body;

        // Handle arrays/objects from FormData string
        if (typeof specialties === 'string') {
            try { specialties = JSON.parse(specialties); } catch (e) { specialties = []; }
        }
        if (typeof workingHours === 'string') {
            try { workingHours = JSON.parse(workingHours); } catch (e) { workingHours = null; }
        }

        const dataToUpdate = {
            name,
            title,
            bio,
            specialties: specialties ? JSON.stringify(specialties) : undefined,
            workingHours: workingHours ? JSON.stringify(workingHours) : undefined
        };

        // Handle Photo
        if (req.file) {
            const protocol = req.protocol;
            const host = req.get('host');
            dataToUpdate.photo = `${protocol}://${host}/uploads/${req.file.filename}`;
        } else if (req.body.photo) {
            // Keep existing photo URL if passed back (or updated string URL)
            dataToUpdate.photo = req.body.photo;
        }

        // Remove undefined keys
        Object.keys(dataToUpdate).forEach(key => dataToUpdate[key] === undefined && delete dataToUpdate[key]);

        const professional = await prisma.professional.update({
            where: { id: parseInt(req.params.id) },
            data: dataToUpdate
        });

        res.json({
            ...professional,
            specialties: JSON.parse(professional.specialties),
            workingHours: JSON.parse(professional.workingHours)
        });
    } catch (error) {
        console.error('Update pro error:', error);
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
