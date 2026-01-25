const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, name: true, role: true, permissions: true }
        });

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Attach user to request object
        req.user = user;

        // Parse permissions if string
        if (req.user.permissions && typeof req.user.permissions === 'string') {
            try {
                req.user.permissions = JSON.parse(req.user.permissions);
            } catch (e) {
                req.user.permissions = [];
            }
        }

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(500).json({ error: 'Server error' });
    }
};

// RBAC: Require Role
authMiddleware.requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        // Check if user role is allowed. 
        // Note: roles are Strings like "SALON_OWNER", "STAFF"
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access Denied: Insufficient Role' });
        }
        next();
    };
};

// RBAC: Require Permission
authMiddleware.requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

        // Super Admins and Owners usually have full access, but let's be explicit
        if (['SUPER_ADMIN', 'SALON_OWNER'].includes(req.user.role)) {
            return next();
        }

        const userPermissions = req.user.permissions || [];
        if (!userPermissions.includes(permission)) {
            return res.status(403).json({ error: `Access Denied: Missing permission ${permission}` });
        }
        next();
    };
};

module.exports = authMiddleware;
