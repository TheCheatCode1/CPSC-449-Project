const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');
const roleAuth = require('../middleware/roleMiddleware');
const adminController = require('../controllers/adminController');

// View a user's full data
router.get('/user-data', auth, roleAuth('admin'), adminController.getUserData);

// Delete a set, card, or quiz by ID
router.delete('/delete/:username/:type/:id', auth, roleAuth('admin'), adminController.deleteById);

module.exports = router;
