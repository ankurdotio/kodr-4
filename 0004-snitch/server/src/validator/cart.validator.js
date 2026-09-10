import { body, param } from "express-validator"
import { validateRequest } from "../utils/validate.js"


export const addToCartValidator = [

    param("productId").isMongoId().withMessage("Invalid product ID"),
    body("size")
        .notEmpty().withMessage("Size is required")
        .isIn([ "XS", "S", "M", "L", "XL", "XXL" ]).withMessage("Invalid size, must be one of XS, S, M, L, XL, XXL"),
    body("quantity")
        .notEmpty().withMessage("Quantity is required")
        .isInt({ min: 1 }).withMessage("Quantity must be a positive integer"),
    validateRequest

]