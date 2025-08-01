const express = require('express');
const Set = require('../models/set');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const set = new Set({
      ...req.body,
      userId: req.user._id // ✅ updated
    });
    await set.save();
    res.status(201).json(set);
  } catch (err) {
    console.error(err); // helpful for debugging
    res.status(500).json({ error: 'Failed to create set' });
  }
});

// Get all sets
router.get('/', auth, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== 'admin') {
      filter.userId = req.user._id; // ✅ updated
    }

    const sets = await Set.find(filter);
    res.json(sets);
  } catch (err) {
    console.error(err); // helpful for debugging
    res.status(500).json({ error: err.message });
  }
});

// DELETE set by ID
router.delete('/:id', auth, async (req, res) => {
  try {
    const set = await Set.findById(req.params.id);
    if (!set) return res.status(404).json({ error: 'Set not found' });

    // 🔐 Only allow the user who owns the set OR an admin
    if (set.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Not your set' });
    }

    await Set.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Set deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
});


module.exports = router;
