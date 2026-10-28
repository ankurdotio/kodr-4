import { body, validationResult } from "express-validator"

export const validateUrl = [
    body("originalUrl")
        .isURL({
            protocols: [ "http", "https" ],
            require_protocol: true
        })
        .withMessage("Invalid URL")
        .custom((value) => {
            if (value.startsWith("http://localhost:") || value.startsWith("https://localhost:")) {
                throw new Error("URL cannot be of our own domain")
            }
            return true
        }),
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        next()
    }
]