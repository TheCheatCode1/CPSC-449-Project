const express = require('express');
const router = express.Router();
const Set = require('../models/set');
const Card = require('../models/card');
const auth = require('../middleware/authMiddleware');
const roleAuth = require('../middleware/roleMiddleware');

const axios = require('axios');

// Lookup word from dictionary API
router.get('/lookup/:word', auth, async (req, res) => {
  const word = req.params.word;
  try {
    const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const data = response.data[0];
    const result = {
      word: data.word,
      partOfSpeech: data.meanings[0]?.partOfSpeech || 'N/A',
      definition: data.meanings[0]?.definitions[0]?.definition || 'No definition found'
    };
    res.json(result);
  } catch (error) {
    res.status(404).json({ message: 'Word not found' });
  }
});

router.get('/admin/all-sets', auth, roleAuth('admin'), async (req, res) => {
  try {
    const sets = await Set.find().populate('createdBy', 'username');
    res.json(sets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/admin/sets/:id', auth, roleAuth('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const set = await Set.findByIdAndDelete(id);
    if (!set) {
      return res.status(404).json({ error: 'Set not found' });
    }

    await Card.deleteMany({ setId: id });

    res.json({ message: 'Set and all its cards deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/sets/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const set = await Set.findById(id);
    
    if (!set) {
      return res.status(404).json({ error: 'Set not found' });
    }

    // Admin can see any set, users can only see their own
    if (req.user.role !== 'admin' && set.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only view your own sets' });
    }

    res.json(set);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/flashcards/sets?search=keyword
router.get('/sets', auth, async (req, res) => {
  try {
    const q = req.query.search;
    let filter = {};
    if (q) {
      filter.title = { $regex: q, $options: 'i' };
    }

    // Admin can see all sets, users can only see their own
    if (req.user.role !== 'admin') {
      filter.createdBy = req.user._id;
    }

    const sets = await Set.find(filter).sort({ updatedAt: -1 });
    res.json(sets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new flashcard set
router.post('/sets', auth, async (req, res) => {
  try {
    const set = new Set({
      ...req.body,
      createdBy: req.user._id //
    });
    await set.save();
    res.status(201).json(set);
  } catch (err) {
    console.error('[ERROR] Failed to create set:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// Delete a flashcard set and its cards
router.delete('/sets/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const set = await Set.findById(id);
    if (!set) {
      return res.status(404).json({ error: 'Set not found' });
    }

    if (req.user.role !== 'admin' && set.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own sets' });
    }

    // Remove all cards belonging to that set
    await Card.deleteMany({ setId: id });
    // Remove the set itself
    await Set.findByIdAndDelete(id);
    res.json({ message: 'Set deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// Create a new card in a set
router.post('/cards', auth, async (req, res) => {
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

// Get all cards for a set
router.get('/cards/by-set/:setId', auth, async (req, res) => {
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

// Update a card
router.put('/cards/:id', auth, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    if (req.user.role !== 'admin' && card.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only update your own cards' });
    }

    const updated = await Card.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a card
router.delete('/cards/:id', auth, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    if (req.user.role !== 'admin' && card.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own cards' });
    }

    const deleted = await Card.findByIdAndDelete(req.params.id);
    res.json({ message: 'Card deleted', deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/ai-generate', auth, async (req, res) => {
  try {
    const { topic, count = 5 } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const flashcardCount = Math.min(Math.max(parseInt(count), 1), 10);

    const apiKey = process.env.TOGETHER_API_KEY;
    const model = process.env.TOGETHER_MODEL || 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free';

    if (!apiKey) {
      console.error('Together AI API key missing. Please set TOGETHER_API_KEY');
      return res.status(500).json({ error: 'AI service not configured.' });
    }

    const prompt = `Generate ${flashcardCount} educational flashcards for the topic "${topic}". 
    
    For each flashcard, provide:
    1. A clear, concise question or concept (front of card), must not be too long
    2. A detailed, educational answer (back of card)
    3. A practical example or application
    
    Format the response as a JSON array with this structure:
    [
      {
        "front": "Question or concept",
        "back": "Detailed answer/explanation",
        "example": "Practical example or application"
      }
    ]
    
    Make the content educational, accurate, and suitable for studying. Avoid repetitive language patterns.`;

    const response = await axios.post(
      'https://api.together.xyz/v1/chat/completions',
      {
        model: model,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Together AI response:', response.data.choices[0].message.content);

    const aiResponse = response.data.choices[0].message.content;

    let flashcards;
    try {
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0]);
      } else {
        flashcards = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.log('AI Response:', aiResponse);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    if (!Array.isArray(flashcards)) {
      return res.status(500).json({ error: 'Invalid flashcard format from AI' });
    }

    flashcards = flashcards.slice(0, flashcardCount);

    res.json({
      topic,
      count: flashcardCount,
      flashcards: flashcards
    });
  } catch (err) {
    console.error('AI generation error:', err);

    if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
      res.status(500).json({
        error: 'Invalid API key. Please check your TOGETHER_API_KEY.'
      });
    } else {
      res.status(500).json({ error: 'Failed to generate flashcards: ' + err.message });
    }
  }
});

module.exports = router;
