const express = require('express');
const Quiz = require('../models/Quiz');
const router = express.Router();

// Create quiz
router.post('/', async (req, res) => {
  const quiz = new Quiz(req.body);
  await quiz.save();
  res.status(201).json(quiz);
});

// Get all quizzes
router.get('/', async (req, res) => {
  const quizzes = await Quiz.find();
  res.json(quizzes);
});


// Get a single quiz
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: 'Invalid quiz ID or internal error' });
  }
});


// Submit quiz answers and return score
router.post('/:id/submit', async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  const userAnswers = req.body.answers;

  let score = 0;
  quiz.questions.forEach((q, i) => {
    if (q.correctAnswer === userAnswers[i]) score++;
  });

  res.json({ score, total: quiz.questions.length });
});

module.exports = router;

router.get('/:id', async (req, res) => {
  console.log('Fetching quiz with ID:', req.params.id);
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      console.log('Quiz not found.');
      return res.status(404).json({ error: 'Quiz not found' });
    }
    res.json(quiz);
  } catch (err) {
    console.error('Error loading quiz:', err);
    res.status(500).json({ error: 'Invalid quiz ID or internal error' });
  }
});

router.post('/', async (req, res) => {
  console.log('Incoming quiz:', req.body);  // <- Add this
  const quiz = new Quiz(req.body);
  await quiz.save();
  res.status(201).json(quiz);
});
