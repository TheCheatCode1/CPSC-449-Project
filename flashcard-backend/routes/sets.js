const express = require('express');
const Set = require('../models/set');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const set = new Set({
      ...req.body,
      createdBy: req.user._id
    });
    await set.save();
    res.status(201).json(set);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create set' });
  }
});

// Get all sets
router.get('/', auth, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== 'admin') {
      filter.createdBy = req.user._id;
    }

    const sets = await Set.find(filter);
    res.json(sets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
