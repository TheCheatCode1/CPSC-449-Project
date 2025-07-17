const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(error => ({
                field: error.path,
                message: error.msg,
                value: error.value
            }))
        });
    }
    next();
};

/**
 * Validation rules for user registration
 */
const validateRegistration = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores')
        .custom(async (value) => {
            const User = require('../models/User');
            const existingUser = await User.findOne({ username: value });
            if (existingUser) {
                throw new Error('Username already exists');
            }
            return true;
        }),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    body('role')
        .optional()
        .isIn(['user', 'admin'])
        .withMessage('Role must be either "user" or "admin"'),
    handleValidationErrors
];

/**
 * Validation rules for user login
 */
const validateLogin = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];

/**
 * Validation rules for flashcard creation
 */
const validateFlashcard = [
    body('word')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Word must be between 1 and 100 characters'),
    body('definition')
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('Definition must be between 1 and 500 characters'),
    body('partOfSpeech')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Part of speech must be less than 50 characters'),
    handleValidationErrors
];

/**
 * Validation rules for deck creation
 */
const validateDeck = [
    body('name')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Deck name must be between 1 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),
    body('isPublic')
        .optional()
        .isBoolean()
        .withMessage('isPublic must be a boolean value'),
    handleValidationErrors
];

/**
 * Validation rules for MongoDB ObjectId parameters
 */
const validateObjectId = (paramName) => [
    param(paramName)
        .isMongoId()
        .withMessage(`${paramName} must be a valid MongoDB ObjectId`),
    handleValidationErrors
];

/**
 * Validation rules for pagination queries
 */
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('sort')
        .optional()
        .isIn(['createdAt', 'updatedAt', 'word', 'name'])
        .withMessage('Invalid sort field'),
    query('order')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Order must be either "asc" or "desc"'),
    handleValidationErrors
];

/**
 * Validation rules for search queries
 */
const validateSearch = [
    query('q')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search query must be between 1 and 100 characters'),
    handleValidationErrors
];

/**
 * Sanitize user inputs
 */
const sanitizeInputs = [
    body('username').trim().escape(),
    body('word').trim().escape(),
    body('definition').trim().escape(),
    body('partOfSpeech').trim().escape(),
    body('name').trim().escape(),
    body('description').trim().escape(),
];

/**
 * Custom validation for password strength
 */
const validatePasswordStrength = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    
    if (password.length < minLength) {
        errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUpperCase) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
        errors.push('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
        errors.push('Password must contain at least one special character');
    }

    return errors;
};

module.exports = {
    handleValidationErrors,
    validateRegistration,
    validateLogin,
    validateFlashcard,
    validateDeck,
    validateObjectId,
    validatePagination,
    validateSearch,
    sanitizeInputs,
    validatePasswordStrength
}; 