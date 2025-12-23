const express = require('express');

const authenticateToken = require('../middleware/auth');
const router = express.Router();
const prisma = require('../lib/prisma');

router.use(authenticateToken);

// GET /api/chat/conversations
// Returns list of conversations for the current user
router.get('/conversations', async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({ where: { id: userId }, include: { ownedSalons: true } });

        let where = {};

        // If salon owner, get conversations for all owned salons
        if (user.role === 'salon_owner' || user.role === 'admin') {
            const salonIds = user.ownedSalons.map(s => s.id);
            where = {
                OR: [
                    { salonId: { in: salonIds } }, // Chats directed to my salons
                    { userId: userId }             // Chats I started as a user
                ]
            };
        } else {
            // Regular user
            where = { userId: userId };
        }

        const conversations = await prisma.conversation.findMany({
            where,
            include: {
                salon: { select: { id: true, name: true, image: true } },
                user: { select: { id: true, name: true, avatar: true } },
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        res.json(conversations);
    } catch (error) {
        console.error('Get Conversations Error:', error);
        res.status(500).json({ error: 'Sohbetler yüklenirken hata oluştu.' });
    }
});

// GET /api/chat/conversations/:id/messages
router.get('/conversations/:id/messages', async (req, res) => {
    try {
        const conversationId = parseInt(req.params.id);
        const userId = req.user.id;

        // Security check: user must belong to conversation
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { salon: true }
        });

        if (!conversation) return res.status(404).json({ error: 'Sohbet bulunamadı.' });

        // Logic to check ownership
        // Simple check: is user the creator OR the owner of the salon?
        const isParticipant = conversation.userId === userId || conversation.salon.ownerId === userId;

        // Note: Ideally we check deeper. For now assume ownerId on salon is strict.

        // Allow if user owns the salon via relation check (expensive but safe)
        // Or simpler:
        // const userSalons = await prisma.salon.findMany({ where: { ownerId: userId } });
        // const isOwner = userSalons.some(s => s.id === conversation.salonId);

        // For Proof of Concept, let's allow read if authorized token is present? 
        // No, strict check:
        let authorized = conversation.userId === userId;
        if (!authorized) {
            const salon = await prisma.salon.findUnique({ where: { id: conversation.salonId } });
            if (salon.ownerId === userId) authorized = true;
        }

        if (!authorized) {
            return res.status(403).json({ error: 'Bu sohbeti görüntüleme yetkiniz yok.' });
        }

        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' }
        });

        res.json(messages);

    } catch (error) {
        console.error('Get Messages Error:', error);
        res.status(500).json({ error: 'Mesajlar yüklenirken hata oluştu.' });
    }
});

// POST /api/chat/conversations
// Start a new chat (User -> Salon)
router.post('/conversations', async (req, res) => {
    try {
        const { salonId } = req.body;
        const userId = req.user.id;

        let conversation = await prisma.conversation.findUnique({
            where: {
                salonId_userId: {
                    salonId: parseInt(salonId),
                    userId: userId
                }
            }
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    salonId: parseInt(salonId),
                    userId: userId
                }
            });
        }

        res.json(conversation);
    } catch (error) {
        console.error('Create Conversation Error:', error);
        res.status(500).json({ error: 'Sohbet başlatılamadı.' });
    }
});

// POST /api/chat/messages
router.post('/messages', async (req, res) => {
    try {
        const { conversationId, content } = req.body;
        const userId = req.user.id;

        const conversation = await prisma.conversation.findUnique({
            where: { id: parseInt(conversationId) },
            include: { salon: true }
        });

        if (!conversation) return res.status(404).json({ error: 'Sohbet bulunamadı.' });

        // Determine sender type
        let senderType = 'USER';
        if (conversation.salon.ownerId === userId) {
            senderType = 'SALON';
        }

        const message = await prisma.message.create({
            data: {
                conversationId: parseInt(conversationId),
                content,
                senderType
            }
        });

        // Update conversation timestamp
        await prisma.conversation.update({
            where: { id: parseInt(conversationId) },
            data: { updatedAt: new Date() }
        });

        res.json(message);

    } catch (error) {
        console.error('Send Message Error:', error);
        res.status(500).json({ error: 'Mesaj gönderilemedi.' });
    }
});

module.exports = router;
