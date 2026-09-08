import { body } from "express-validator"
import { validateRequest } from "../utils/validate.js"


export const createProductValidator = [
    body("title")
        .notEmpty().withMessage("Title is required")
        .isLength({ min: 3, max: 100 }).withMessage("Title must be between 3 and 100 characters"),
    body("description")
        .notEmpty().withMessage("Description is required")
        .isLength({ min: 50, max: 1000 }).withMessage("Description must be between 10 and 1000 characters"),
    body("price.amount")
        .notEmpty().withMessage("Price amount is required")
        .isFloat({ min: 0 }).withMessage("Price amount must be a positive number"),
    body("price.currency")
        .notEmpty().withMessage("Price currency is required")
        .isIn([ "USD", "EUR", "CAD", "INR" ]).withMessage("Price currency must be one of USD, EUR, CAD, INR"),
    body("categories")
        .isArray().withMessage("Categories must be an array")
        .custom((value) => {
            value.forEach((category) => {
                if (!category || typeof category !== "string" || category.trim() === "") {
                    throw new Error("Each category must be a non-empty string")
                }
            })
        }),
    body("sizes")
        .isArray().withMessage("Sizes must be an array"),
    body("sizes.*.size")
        .notEmpty().withMessage("Size is required")
        .isIn([ "XS", "S", "M", "L", "XL", "XXL" ]).withMessage("Size must be one of XS, S, M, L, XL, XXL"),
    body("sizes.*.quantity")
        .notEmpty().withMessage("Quantity is required")
        .isInt({ min: 0 }).withMessage("Quantity must be a non-negative integer"),

    validateRequest
]