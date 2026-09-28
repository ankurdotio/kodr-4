import { body } from "express-validator";

/**
 * Validation chain for POST /auth/register.
 */
export const registerValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be 2-50 characters"),
    body("username")
        .trim()
        .notEmpty()
        .withMessage("Username is required")
        .isLength({ min: 3, max: 30 })
        .withMessage("Username must be 3-30 characters")
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage("Username may contain only letters, numbers, and underscores")
        .toLowerCase(),
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Enter a valid email address")
        .normalizeEmail(),
    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
        .matches(/[A-Za-z]/)
        .withMessage("Password must contain a letter")
        .matches(/\d/)
        .withMessage("Password must contain a number"),
    body("coffeePrice")
        .exists()
        .withMessage("Coffee price is required")
        .isInt({ min: 20, max: 500 })
        .withMessage("Coffee price must be between 20 and 500"),
    body("bio")
        .optional()
        .trim()
        .isLength({ max: 160 })
        .withMessage("Bio must be at most 160 characters"),
];

/**
 * Validation chain for POST /auth/login. Uses a generic message to avoid leaking which field failed.
 */
export const loginValidator = [
    body("email").trim().isEmail().withMessage("Invalid credentials").normalizeEmail(),
    body("password").notEmpty().withMessage("Invalid credentials"),
];
