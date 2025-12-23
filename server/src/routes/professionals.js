const express = require('express');

const authMiddleware = require('../middleware/auth');
const { checkSubscriptionLimit } = require('../utils/subscription');
const path = require('path');
const upload = require('../config/cloudinary');

const router = express.Router();
const prisma = require('../lib/prisma');

// Multer Config
// Multer Config removed - imported from config/cloudinary

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
        let photoUrl = req.body.photoUrl || '';
        if (req.file) {
            // Cloudinary returns the verified URL in req.file.path
            photoUrl = req.file.path;
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
            dataToUpdate.photo = req.file.path;
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
