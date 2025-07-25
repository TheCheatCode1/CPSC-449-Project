const express = require('express');
const router = express.Router();
const Set = require('../models/set');
const Card = require('../models/card');
const auth = require('../middleware/authMiddleware');

const axios = require('axios');

// Lookup word from dictionary API
router.get('/lookup/:word', async (req, res) => {
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

// GET /api/flashcards/sets?search=keyword
router.get('/sets', async (req, res) => {
  try {
    const q = req.query.search;
    let filter = {};
    if (q) {
      filter.title = { $regex: q, $options: 'i' };
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


// Get all sets
router.get('/sets', async (req, res) => {
  try {
    const sets = await Set.find();
    res.json(sets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a flashcard set and its cards
router.delete('/sets/:id', async (req, res) => {
  try {
    const { id } = req.params;
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

router.post('/ai-generate', async (req, res) => {
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
