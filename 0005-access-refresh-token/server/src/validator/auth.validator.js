import { body } from "express-validator"


export const registerValidator = [
    body("name")
        .exists().withMessage("Name is required")
        .isString().withMessage("Name must be a string")
        .trim()
        .isLength({ min: 3 }).withMessage("Name must be at least 3 characters long")
        .isAlpha("en-IN", { ignore: " " }).withMessage("Name must contain only letters and spaces"),
    body("email")
        .exists().withMessage("Email is required")
        .isEmail().withMessage("Email must be a valid email address"),
    body("password")
        .exists().withMessage("Password is required")
        .isString().withMessage("Password must be a string")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")

]


/**
 * req.body = {
 *   name: "John Doe"
 * }
 */