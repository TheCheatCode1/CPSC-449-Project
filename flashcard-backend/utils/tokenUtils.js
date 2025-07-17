const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const generateTokens = (user) => {
    const payload = {
        id: user._id,
        username: user.username,
        role: user.role
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });

    return {
        accessToken,
        refreshToken,
        expiresIn: JWT_EXPIRES_IN
    };
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

const refreshAccessToken = (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET);
        const newAccessToken = jwt.sign(
            { id: decoded.id, username: decoded.username, role: decoded.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
        return { accessToken: newAccessToken, expiresIn: JWT_EXPIRES_IN };
    } catch (error) {
        return null;
    }
};

const extractTokenFromHeader = (authHeader) => {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
};

module.exports = {
    generateTokens,
    verifyToken,
    refreshAccessToken,
    extractTokenFromHeader,
    JWT_SECRET
};
