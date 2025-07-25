const express = require('express');
const Set = require('/models/Set');
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
router.get('/', async (req, res) => {
  const sets = await Set.find();
  res.json(sets);
});

module.exports = router;
