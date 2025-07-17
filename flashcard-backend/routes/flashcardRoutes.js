// Backend: API routes for flashcard CRUD operations


const express = require('express');
const router = express.Router();
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

const Flashcard = require('../models/Flashcard');

// Save a flashcard
router.post('/save', async (req, res) => {
    const { userId, word, partOfSpeech, definition } = req.body;

    try {
        const newFlashcard = new Flashcard({ userId, word, partOfSpeech, definition });
        await newFlashcard.save();
        res.json({ message: 'Flashcard saved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error saving flashcard' });
    }
});


module.exports = router;
