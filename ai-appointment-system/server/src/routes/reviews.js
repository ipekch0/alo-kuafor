const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');
const router = express.Router();
const prisma = new PrismaClient();

// GET /api/reviews/:salonId
router.get('/:salonId', async (req, res) => {
    try {
        const { salonId } = req.params;
        const reviews = await prisma.review.findMany({
            where: { salonId: parseInt(salonId) },
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { avatar: true } } } // Optional: get avatar if registered
        });
        res.json(reviews);
    } catch (error) {
        console.error('Get Reviews Error:', error);
        res.status(500).json({ error: 'Yorumlar yüklenirken hata oluştu.' });
    }
});

// POST /api/reviews
router.post('/', async (req, res) => {
    try {
        // Authenticate optional (guests can review?) 
        // For now let's allow public reviews but ideally we track IP or something.
        // Or we can check if req.user exists (if middleware was used optionally).

        // Wait, current implementation uses global middleware per route usually.
        // Let's make this route public but check headers manually if needed, 
        // or effectively just take the payload.

        const { salonId, rating, comment, userName, userId } = req.body;

        if (!salonId || !rating || !userName) {
            return res.status(400).json({ error: 'Eksik bilgi.' });
        }

        const newReview = await prisma.review.create({
            data: {
                salonId: parseInt(salonId),
                rating: parseInt(rating),
                comment,
                userName,
                userId: userId ? parseInt(userId) : null
            }
        });

        // Update Salon Average Rating
        const aggregates = await prisma.review.aggregate({
            where: { salonId: parseInt(salonId) },
            _avg: { rating: true },
            _count: { rating: true }
        });

        const avgRating = aggregates._avg.rating || 0;
        const reviewCount = aggregates._count.rating || 0;

        await prisma.salon.update({
            where: { id: parseInt(salonId) },
            data: {
                rating: parseFloat(avgRating.toFixed(1)),
                reviewCount: reviewCount
            }
        });

        res.json(newReview);

    } catch (error) {
        console.error('Create Review Error:', error);
        res.status(500).json({ error: 'Yorum yapılırken hata oluştu.' });
    }
});

module.exports = router;
