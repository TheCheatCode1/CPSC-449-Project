# Flashcard Backend Project

## Setup
1. Clone repo
2. npm install
3. Configure `.env` with Mongo URI:
   MONGO_URI=mongodb://127.0.0.1:27017/flashcardDB
4. npm run dev

## Features
- Register user/admin
- Login with redirection
- Role-based page protection
- Logout clears session

## API Endpoints
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/users
