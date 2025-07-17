// Backend: API routes for user authentication (login/register)
// flashcard-backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { 
    register, 
    login, 
    refreshToken, 
    getProfile, 
    updateProfile, 
    listUsers, 
    logout 
} = require('../controllers/authController');
const { 
    validateRegistration, 
    validateLogin 
} = require('../middleware/validationMiddleware');
const { 
    authenticateToken, 
    requireRole 
} = require('../middleware/authMiddleware');

// Public routes (no authentication required)
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refreshToken);

// Protected routes (authentication required)
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/logout', authenticateToken, logout);

// Admin only routes
router.get('/users', authenticateToken, requireRole('admin'), listUsers);

module.exports = router;
