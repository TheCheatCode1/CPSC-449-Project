// controllers/quizController.js
const axios = require('axios');

const fetchExternalQuiz = async (req, res) => {
  const { subject } = req.query;

  try {
    const response = await axios.get('https://quizapi.io/api/v1/questions', {
      headers: { 'X-Api-Key': process.env.QUIZ_API_KEY },
      params: {
        category: subject,
        limit: 5, // you can change this
        difficulty: 'Easy',
        multiple_correct_answers: false,
      },
    });

    const questions = response.data.map(q => ({
      question: q.question,
      answers: q.answers,
      correct_answer: q.correct_answer
    }));

    res.json({ questions });
  } catch (err) {
    console.error('❌ Error fetching quiz:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch quiz questions' });
  }
};

module.exports = { fetchExternalQuiz };
