// Backend: API routes for user authentication (login/register)
// flashcard-backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { register, login, listUsers } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

// NEW: get all users
router.get('/users', listUsers);

module.exports = router;
