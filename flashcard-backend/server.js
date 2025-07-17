// Backend: Main Express server setup

require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const flashcardRoutes = require('./routes/flashcardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/flashcards', flashcardRoutes);

// Test route to verify API is running
app.get('/api/health', (req, res) => {
    res.json({ message: 'API is running' });
});

// Serve static frontend files from /public
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to frontend index.html for any unknown route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
