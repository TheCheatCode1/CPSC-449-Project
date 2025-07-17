// Backend: Mongoose schema for Flashcard model

const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    word: { type: String, required: true },
    partOfSpeech: String,
    definition: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Flashcard', flashcardSchema);
