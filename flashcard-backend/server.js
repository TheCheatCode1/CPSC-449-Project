require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const flashcardRoutes = require('./routes/flashcardRoutes');
const quizRoutes = require('./routes/quizRoutes'); // move this here 👈

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/quizzes', quizRoutes); // 👈 MOVE THIS ABOVE STATIC FILES

// Test route
app.get('/api/health', (req, res) => {
    res.json({ message: 'API is running' });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all route (must be last!)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
