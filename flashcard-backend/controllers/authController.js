const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateTokens, refreshAccessToken } = require('../utils/tokenUtils');
const { validatePasswordStrength } = require('../middleware/validationMiddleware');

const register = async (req, res) => {
    try {
        const { username, password, role = 'user' } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username already taken',
                error: 'USERNAME_EXISTS'
            });
        }

        const passwordErrors = validatePasswordStrength(password);
        if (passwordErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Password too weak',
                errors: passwordErrors,
                error: 'WEAK_PASSWORD'
            });
        }

        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = await User.create({
            username,
            password: hashedPassword,
            role
        });

        const tokens = generateTokens(user);

        const userResponse = {
            id: user._id,
            username: user.username,
            role: user.role,
            createdAt: user.createdAt
        };

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            data: {
                user: userResponse,
                tokens
            }
        });
    } catch (error) {
        console.error('Registration failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create account',
            error: 'REGISTRATION_ERROR'
        });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Wrong username or password',
                error: 'INVALID_CREDENTIALS'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Wrong username or password',
                error: 'INVALID_CREDENTIALS'
            });
        }

        const tokens = generateTokens(user);

        const userResponse = {
            id: user._id,
            username: user.username,
            role: user.role,
            createdAt: user.createdAt
        };

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userResponse,
                tokens
            }
        });
    } catch (error) {
        console.error('Login failed:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: 'LOGIN_ERROR'
        });
    }
};

const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token needed',
                error: 'MISSING_REFRESH_TOKEN'
            });
        }

        const newTokens = refreshAccessToken(refreshToken);
        if (!newTokens) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token',
                error: 'INVALID_REFRESH_TOKEN'
            });
        }

        res.json({
            success: true,
            message: 'Token refreshed',
            data: newTokens
        });
    } catch (error) {
        console.error('Token refresh failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to refresh token',
            error: 'REFRESH_ERROR'
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = req.user;
        
        const userResponse = {
            id: user._id,
            username: user.username,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.json({
            success: true,
            data: userResponse
        });
    } catch (error) {
        console.error('Get profile failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile',
            error: 'PROFILE_ERROR'
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { username, currentPassword, newPassword } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                error: 'USER_NOT_FOUND'
            });
        }

        const updates = {};

        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Username already taken',
                    error: 'USERNAME_EXISTS'
                });
            }
            updates.username = username;
        }

        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password required',
                    error: 'CURRENT_PASSWORD_REQUIRED'
                });
            }

            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Current password wrong',
                    error: 'INVALID_CURRENT_PASSWORD'
                });
            }

            const passwordErrors = validatePasswordStrength(newPassword);
            if (passwordErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'New password too weak',
                    errors: passwordErrors,
                    error: 'WEAK_PASSWORD'
                });
            }

            const saltRounds = 12;
            updates.password = await bcrypt.hash(newPassword, saltRounds);
        }

        if (Object.keys(updates).length > 0) {
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                updates,
                { new: true, runValidators: true }
            ).select('-password');

            res.json({
                success: true,
                message: 'Profile updated',
                data: updatedUser
            });
        } else {
            res.json({
                success: true,
                message: 'No changes made',
                data: user
            });
        }
    } catch (error) {
        console.error('Update profile failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: 'UPDATE_PROFILE_ERROR'
        });
    }
};

const listUsers = async (req, res) => {
    try {
        const users = await User.find({}, 'username role createdAt updatedAt');
        
        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('List users failed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get users',
            error: 'LIST_USERS_ERROR'
        });
    }
};

const logout = async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout failed:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed',
            error: 'LOGOUT_ERROR'
        });
    }
};

module.exports = {
    register,
    login,
    refreshToken,
    getProfile,
    updateProfile,
    listUsers,
    logout
};


