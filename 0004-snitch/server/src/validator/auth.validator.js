import { body, query, param, validationResult } from "express-validator"
import { validateRequest } from "../utils/validate.js"

export const registerValidator = [
    body("name")
        .notEmpty().withMessage("Name is required")
        .isLength({ min: 3 }).withMessage("Name must be at least 3 characters long"),
    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Email is not valid"),
    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    validateRequest
]

export const loginValidator = [
    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Email is not valid"),
    body("password")
        .notEmpty().withMessage("Password is required"),
    validateRequest
]