const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // Load from server/.env
const validateEnv = require('./utils/validateEnv');

// validateEnv(); // Use detailed validation
try {
    console.log('[DEBUG] Starting Environment Validation...');
    validateEnv();
    console.log('[DEBUG] Environment Validation PASSED');
} catch (error) {
    console.error('[CRITICAL DEBUG] Environment Validation FAILED:', error.message);
    // DO NOT EXIT - We want to see the error via /api/health or /api/db-test
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');

const prisma = require('./lib/prisma');
const app = express();
// Enable preflight for all routes (Express 5 compatible wildcard)
// Enable preflight handled by main cors middleware
app.use(cors({
    origin: true, // Allow any origin (Reflect request origin)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://connect.facebook.net", "https://graph.facebook.com", "https://facebook.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            connectSrc: ["'self'", "https://graph.facebook.com", "https://www.facebook.com"],
            frameSrc: ["'self'", "https://www.facebook.com", "https://web.facebook.com/"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" }
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

// DB Debug Endpoint (Re-added)
app.get('/api/db-test', async (req, res) => {
    try {
        const dbStatus = prisma ? 'Initialized' : 'Undefined';
        const envStatus = process.env.DATABASE_URL ? 'Set' : 'Missing';

        let queryResult = 'Not attempted';
        if (prisma) {
            const count = await prisma.user.count();
            queryResult = `Success! User count: ${count}`;
        }

        res.json({
            status: 'ok',
            prisma: dbStatus,
            database_url: envStatus,
            query: queryResult,
            node_env: process.env.NODE_ENV,
            vercel: !!process.env.VERCEL
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message,
            stack: error.stack
        });
    }
});
// Serve static files from the React app
// Serve static files from the React app (ONLY if exists, otherwise API mode)
const clientBuildPath = path.join(__dirname, '../../dist');

// If running on Vercel, simply serve a status message for the root
if (process.env.VERCEL) {
    app.get('/', (req, res) => {
        res.status(200).send('AI Appointment System API is running on Vercel 🚀');
    });
} else {
    // Local development or monolithic hosting
    app.use(express.static(clientBuildPath));
    app.get(/.*/, (req, res) => {
        // Check if it's an API request that fell through
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ error: 'API endpoint not found' });
        }
        // Try sending index.html, if missing (backend-only mode), send status
        if (require('fs').existsSync(path.join(clientBuildPath, 'index.html'))) {
            res.sendFile(path.join(clientBuildPath, 'index.html'));
        } else {
            res.send('API Server Running (Frontend not served from here)');
        }
    });
}

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

let server; // Declare server variable in a scope accessible by SIGINT

// Initialize Database and Start Server
// Initialize Database and Start Server
const initAndStart = async () => {
    try {
        // Start server immediately
        if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
            server = app.listen(PORT, () => {
                console.log(`🚀 Server is running on http://localhost:${PORT}`);
                console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
            });
        }
    } catch (error) {
        console.error('Failed to start server:', error.message);
    }
};

initAndStart();

// Export for Vercel
module.exports = app;

// Keep alive heartbeat
/*
setInterval(() => {
    // console.log('Heartbeat...'); // Uncomment for debug
}, 10000);
*/

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
