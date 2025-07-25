// Backend: Handles logic for authentication processes
// flashcard-backend/controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'Username already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username, password: hashedPassword, role });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
        //Create JWT
        console.log("JWT_SECRET from env:", process.env.JWT_SECRET);
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            token,
            role: user.role
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


const listUsers = async (req, res) => {
    try {
        const users = await User.find({}, 'username role'); // select only username and role
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


module.exports = { register, login, listUsers };


