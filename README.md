# QuickFlash – Flashcard & Quiz Study App

QuickFlash is a full-stack flashcard and quiz web application designed to help users study effectively. It supports user authentication, real-time updates via WebSockets, and API integrations for enhanced learning.

## Features

### User Roles
- User: Create, view, and study flashcard sets and quizzes.
- Admin: Full access to all user data, including editing/deleting any flashcards, cards, and quizzes in real-time.

### Flashcards
- Create flashcard sets with multiple cards.
- Flip to view definitions.
- Navigate with next/previous buttons and shuffle.
- Real-time deletion support via WebSockets.

### Quizzes
- Create custom quizzes with multiple-choice questions.
- Take quizzes and get instant scores.
- Save or delete quizzes in real-time.

### QuizAPI Integration
- Load external quizzes by topic using QuizAPI.io.
- Select a topic from a dropdown (e.g., JavaScript, HTML, Linux).
- Save imported quizzes directly into your dashboard.

### Real-Time Sync
- Admin deletions and edits are instantly reflected on all clients via WebSockets.

### Authentication
- JWT-based login and registration.
- Role-based access control (user vs. admin).

## Tech Stack

- Frontend: HTML, CSS, JavaScript (Vanilla)
- Backend: Node.js, Express
- Database: MongoDB (via Mongoose)
- Authentication: JWT + bcrypt
- WebSocket: Socket.IO
- External API: QuizAPI.io

## Setup Instructions

1. Clone the repository:

```bash
git clone https://github.com/your-username/quickflash.git
cd quickflash

npm install

MONGO_URI=your_mongodb_uri
JWT_SECRET=your_super_secret_string
QUIZ_API_KEY=your_quizapi_key
TOGETHER_AI_API=your_AI_api
