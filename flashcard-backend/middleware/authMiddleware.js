const { verifyToken, extractTokenFromHeader } = require('../utils/tokenUtils');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided',
                error: 'MISSING_TOKEN'
            });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
                error: 'INVALID_TOKEN'
            });
        }

        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
                error: 'USER_NOT_FOUND'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication failed',
            error: 'AUTH_ERROR'
        });
    }
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Login required',
                error: 'AUTHENTICATION_REQUIRED'
            });
        }

        const userRole = req.user.role;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Not enough permissions',
                error: 'INSUFFICIENT_PERMISSIONS'
            });
        }

        next();
    };
};

const requireOwnership = (getResourceUserId) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Login required',
                error: 'AUTHENTICATION_REQUIRED'
            });
        }

        if (req.user.role === 'admin') {
            return next();
        }

        try {
            const resourceUserId = getResourceUserId(req);
            
            if (!resourceUserId) {
                return res.status(400).json({
                    success: false,
                    message: 'Resource not found',
                    error: 'RESOURCE_NOT_FOUND'
                });
            }

            if (req.user._id.toString() !== resourceUserId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied',
                    error: 'ACCESS_DENIED'
                });
            }

            next();
        } catch (error) {
            console.error('Ownership check failed:', error);
            return res.status(500).json({
                success: false,
                message: 'Error checking permissions',
                error: 'OWNERSHIP_CHECK_ERROR'
            });
        }
    };
};

const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = extractTokenFromHeader(authHeader);

        if (token) {
            const decoded = verifyToken(token);
            if (decoded) {
                const user = await User.findById(decoded.id).select('-password');
                if (user) {
                    req.user = user;
                }
            }
        }

        next();
    } catch (error) {
        console.error('Optional auth failed:', error);
        next();
    }
};

module.exports = {
    authenticateToken,
    requireRole,
    requireOwnership,
    optionalAuth
};
