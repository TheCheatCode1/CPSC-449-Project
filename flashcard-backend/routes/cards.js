const express = require('express');
const router = express.Router();
const Card = require('../models/card');
const Set = require('../models/set');
const auth = require('../middleware/authMiddleware');

// Create a new card
router.post('/', auth, async (req, res) => {
  try {
    const set = await Set.findById(req.body.setId);
    if (!set) {
      return res.status(404).json({ error: 'Set not found' });
    }

    if (req.user.role !== 'admin' && set.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only add cards to your own sets' });
    }

    const card = new Card({
      ...req.body,
      createdBy: req.user._id
    });
    await card.save();
    res.status(201).json(card);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all cards for a specific set
router.get('/by-set/:setId', auth, async (req, res) => {
  try {
    const set = await Set.findById(req.params.setId);
    if (!set) {
      return res.status(404).json({ error: 'Set not found' });
    }

    if (req.user.role !== 'admin' && set.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only view cards from your own sets' });
    }

    const cards = await Card.find({ setId: req.params.setId });
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a card by ID
router.put('/:id', auth, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    if (req.user.role !== 'admin' && card.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only update your own cards' });
    }

    const updatedCard = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedCard);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a card by ID
router.delete('/:id', auth, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    if (req.user.role !== 'admin' && card.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own cards' });
    }

    const deletedCard = await Card.findByIdAndDelete(req.params.id);
    res.json({ message: 'Card deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
