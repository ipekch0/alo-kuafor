const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Load from server/.env

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "temp_secret_key_123";

// Manual ENV Injection removed to allow .env usage

process.on('exit', (code) => {
    console.log(`Process exiting with code: ${code}`);
});

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});


// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // Serve uploads

// Routes
// Routes
const authRoutes = require('./routes/auth');
const salonRoutes = require('./routes/salons');
const accountingRoutes = require('./routes/accounting');
const professionalRoutes = require('./routes/professionals');
const serviceRoutes = require('./routes/services');
const customerRoutes = require('./routes/customers');
const appointmentRoutes = require('./routes/appointments');
const aiRoutes = require('./routes/ai');
const whatsappRoutes = require('./routes/whatsapp');
const searchRoutes = require('./routes/search');
const reviewRoutes = require('./routes/reviews');
const chatRoutes = require('./routes/chat');

// Enable critical routes
app.use('/api/auth', authRoutes);
app.use('/api/salons', salonRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/whatsapp', whatsappRoutes);
const authenticateToken = require('./middleware/auth'); // Fixed import

app.use('/api/whatsapp-cloud', require('./routes/whatsappCloud'));
app.use('/api/search', searchRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', require('./routes/notifications'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'AI Appointment API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);
    console.error('PATH:', req.path);
    console.error('STACK:', err.stack);
    res.status(500).json({
        error: 'Sunucu hatası',
        details: err.message,
        path: req.path
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});

// Keep alive heartbeat
setInterval(() => {
    // console.log('Heartbeat...'); // Uncomment for debug
}, 10000);

// Graceful shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit();
});
