// Backend: API routes for user authentication (login/register)
// flashcard-backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { register, login, listUsers } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
const roleAuth = require('../middleware/roleMiddleware');

router.post('/register', register);
router.post('/login', login);

// NEW: get all users - admin only
router.get('/users', auth, roleAuth('admin'), listUsers);

module.exports = router;
