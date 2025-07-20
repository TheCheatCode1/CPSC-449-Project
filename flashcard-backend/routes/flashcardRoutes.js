const express = require('express');
const router = express.Router();
const Set = require('../models/set');
const Card = require('../models/card');


// Create a new flashcard set
router.post('/sets', async (req, res) => {
  try {
    const set = new Set(req.body);
    await set.save();
    res.status(201).json(set);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all sets
router.get('/sets', async (req, res) => {
  try {
    const sets = await Set.find();
    res.json(sets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new card in a set
router.post('/cards', async (req, res) => {
  try {
    const card = new Card(req.body);
    await card.save();
    res.status(201).json(card);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all cards for a set
router.get('/cards/by-set/:setId', async (req, res) => {
  try {
    const cards = await Card.find({ setId: req.params.setId });
    res.json(cards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a card
router.put('/cards/:id', async (req, res) => {
  try {
    const updated = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a card
router.delete('/cards/:id', async (req, res) => {
  try {
    const deleted = await Card.findByIdAndDelete(req.params.id);
    res.json({ message: 'Card deleted', deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
