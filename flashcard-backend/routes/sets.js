const express = require('express');
const Set = require('/models/Set');
const router = express.Router();

router.post('/', async (req, res) => {
  const set = new Set(req.body);
  await set.save();
  res.status(201).json(set);
});

router.get('/', async (req, res) => {
  const sets = await Set.find();
  res.json(sets);
});

module.exports = router;
