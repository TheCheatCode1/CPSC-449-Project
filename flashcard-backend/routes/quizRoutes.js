const express = require('express');
const Quiz = require('../models/Quiz');
const auth = require('../middleware/authMiddleware');
const roleAuth = require('../middleware/roleMiddleware');
const router = express.Router();

// Create quiz
router.post('/', auth, async (req, res) => {
  try {
    const quiz = new Quiz({
      ...req.body,
      createdBy: req.user._id
    });
    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// Get all quizzes
router.get('/', auth, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== 'admin') {
      filter.createdBy = req.user._id;
    }

    const quizzes = await Quiz.find(filter);
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get a single quiz
router.get('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    if (req.user.role !== 'admin' && quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only access your own quizzes' });
    }

    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: 'Invalid quiz ID or internal error' });
  }
});


// Submit quiz answers and return score
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    if (req.user.role !== 'admin' && quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only submit your own quizzes' });
    }

    const userAnswers = req.body.answers;

    let score = 0;
    quiz.questions.forEach((q, i) => {
      if (q.correctAnswer === userAnswers[i]) score++;
    });

    res.json({ score, total: quiz.questions.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/all-quizzes', auth, roleAuth('admin'), async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate('createdBy', 'username');
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/admin/quizzes/:id', auth, roleAuth('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const quiz = await Quiz.findByIdAndDelete(id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json({ message: 'Quiz deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
