import { body } from "express-validator"
import { validateRequest } from "../utils/validate.js"

export const createOrderValidator = [
    body("address.state")
        .notEmpty().withMessage("State is required"),
    body("address.city")
        .notEmpty().withMessage("City is required"),
    body("address.street")
        .notEmpty().withMessage("Street is required"),
    body("address.house")
        .notEmpty().withMessage("House no. is required"),
    body("address.zip")
        .notEmpty().withMessage("ZIP code is required"),
    validateRequest
]