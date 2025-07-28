// Backend: Middleware for role-based authorization
const roleAuth = (requiredRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

        if (req.user.role === 'admin') {
            return next();
        }

        if (roles.includes(req.user.role)) {
            return next();
        }

        return res.status(403).json({ error: 'Insufficient permissions' });
    };
};

module.exports = roleAuth; 