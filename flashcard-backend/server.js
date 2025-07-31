require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const flashcardRoutes = require('./routes/flashcardRoutes');
const quizRoutes = require('./routes/quizRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// 🔧 Create HTTP server from Express app
const server = http.createServer(app);

// 🔌 Attach Socket.IO to server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE"]
  }
});

// ⬇️ Make io accessible in routes/controllers if needed
app.set('io', io);

// 🌐 Connect to MongoDB
connectDB();

// 📦 Middleware
app.use(express.json());

// 🔁 API Routes
app.use('/api/auth', authRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/admin', adminRoutes);

// ✅ Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ message: 'API is running' });
});

// 🌍 Static Files
app.use(express.static(path.join(__dirname, 'public')));

// 🧲 Catch-all for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 🔌 Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('🟢 WebSocket connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔴 WebSocket disconnected:', socket.id);
  });
});

// 🚀 Start the server WITH SOCKET.IO
server.listen(PORT, () => {
  console.log(`🚀 Server + WebSocket running at http://localhost:${PORT}`);
});
