import { body, validationResult } from "express-validator"
import userModel from "../models/user.model.js"


export const registerValidator = [
    body("name")
        .exists().withMessage("Name is required").bail()
        .isString().withMessage("Name must be a string").bail()
        .trim()
        .isLength({ min: 2 }).withMessage("Name must be at least 2 characters long").bail()
        .isAlpha("en-IN", { ignore: " " }).withMessage("Name must contain only letters and spaces"),
    body("email")
        .exists().withMessage("Email is required").bail()
        .isEmail().withMessage("Email must be a valid email address").bail()
        .custom(async (value) => {
            const user = await userModel.findOne({ email: value })
            if (user) {
                throw new Error("Email is already in use");
            }
        }),
    body("password")
        .exists().withMessage("Password is required").bail()
        .isString().withMessage("Password must be a string").bail()
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    (req, res, next) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "invalid input",
                errors: errors.array()
            })
        }

        next();

    }
]


/**
 * req.body = {
 *   name: "John Doe"
 * }
 */