const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Load from server/.env
const validateEnv = require('./utils/validateEnv');

validateEnv();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.set('trust proxy', 1); // Required for Render/Heroku (fixes rate limit crash)
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;


// Manual ENV Injection removed to allow .env usage

process.on('exit', (code) => {
    console.log(`Process exiting with code: ${code}`);
});

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Middleware
const fs = require('fs');
app.use((req, res, next) => {
    try {
        const logPath = path.join(__dirname, '../debug_log_new.txt');
        const timestamp = new Date().toISOString();
        const msg = `[${timestamp}] ${req.method} ${req.originalUrl}\n`;
        fs.appendFileSync(logPath, msg);
    } catch (e) {
        console.error('Logging failed');
    }
    next();
});

// CORS Configuration - MUST BE FIRST
// CORS Configuration - MUST BE FIRST
const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.RENDER_EXTERNAL_URL, // Render automatically sets this
    'https://odak-manage.onrender.com', // Fallback explicit
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3002'
].filter(Boolean);
app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    }
}));

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" } // Allow resource sharing for images
}));

// Rate Limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 login requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
});

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // INCREASED LIMIT for Dev/Polling
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(globalLimiter);
app.use(express.json({
    limit: '50mb',
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));
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
// // const whatsappRoutes = require('./routes/whatsapp'); // Legacy generic route
const searchRoutes = require('./routes/search');
const reviewRoutes = require('./routes/reviews');
const chatRoutes = require('./routes/chat');

// Enable critical routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/salons', salonRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/ai', aiRoutes);
// app.use('/api/whatsapp', whatsappRoutes); // Legacy

const authenticateToken = require('./middleware/auth');

// OFFICIAL CLOUD API ROUTES
app.use('/api/whatsapp', require('./routes/whatsappCloud')); // Now serving at /api/whatsapp directly
// app.use('/api/whatsapp', require('./routes/whatsapp')); // Legacy QR based route
app.use('/api/search', searchRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'AI Appointment API is running' });
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../../dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
// Using regex /.*/ to avoid path-to-regexp v6+ string syntax errors
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
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
// restart
// restart 2
// restart 3
// restart 4
// restart with gemini-pro
// restart with flash-latest
