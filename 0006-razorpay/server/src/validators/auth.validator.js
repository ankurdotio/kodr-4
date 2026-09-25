import { body } from "express-validator";

/** Validation chain for the register endpoint: name, email, and password. */
export const registerValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be between 2 and 50 characters"),
    body("email")
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
        .matches(/[a-zA-Z]/)
        .withMessage("Password must contain a letter")
        .matches(/\d/)
        .withMessage("Password must contain a number"),
];

/** Validation chain for the login endpoint: email and password. */
export const loginValidator = [
    body("email").isEmail().withMessage("Enter a valid email address"),
    body("password").notEmpty().withMessage("Password is required"),
];
