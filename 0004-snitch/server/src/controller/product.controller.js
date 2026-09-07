import productModel from "../models/product.model.js"


export async function createProduct(req, res) {

    const user = req.user

    if (user.role !== "seller") {
        return res.status(403).json({
            message: "Only sellers can create products"
        })
    }

    const { title, description, price: { amount, currency }, categories, sizes } = req.body

    const errors = []

    if (!title) {
        errors.push({
            field: "title",
            message: "Title is required"
        })
    }

    if (title && (title.length < 3 || title.length > 100)) {
        errors.push({
            field: "title",
            message: "Title must be between 3 and 100 characters"
        })
    }

    if (!description) {
        errors.push({
            field: "description",
            message: "Description is required"
        })
    }

    if (description && (description.length < 10 || description.length > 1000)) {
        errors.push({
            field: "description",
            message: "Description must be between 10 and 1000 characters"
        })
    }

    if (!amount) {
        errors.push({
            field: "price.amount",
            message: "Price amount is required"
        })
    }

    if (amount && amount < 0) {
        errors.push({
            field: "price.amount",
            message: "Price amount must be a positive number"
        })
    }

    if (!currency) {
        errors.push({
            field: "price.currency",
            message: "Price currency is required"
        })
    }

    if (currency && ![ "USD", "EUR", "CAD", "INR" ].includes(currency)) {
        errors.push({
            field: "price.currency",
            message: "Price currency must be one of USD, EUR, CAD, INR"
        })
    }

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
        errors.push({
            field: "categories",
            message: "At least one category is required"
        })
    } else {
        categories.forEach((category, index) => {
            if (!category || typeof category !== "string") {
                errors.push({
                    field: `categories[${index}]`,
                    message: "Category must be a string"
                })
            }

            if (category.length < 3 || category.length > 50) {
                errors.push({
                    field: `${category}`,
                    message: "Category must be between 3 and 50 characters"
                })
            }
        })
    }

    if (!sizes || !Array.isArray(sizes) || sizes.length === 0) {
        errors.push({
            field: "sizes",
            message: "At least one size is required"
        })
    } else {
        sizes.forEach((sizeObj, index) => {
            if (!sizeObj.size || ![ "XS", "S", "M", "L", "XL", "XXL" ].includes(sizeObj.size)) {
                errors.push({
                    field: `sizes[${index}].size`,
                    message: "Size must be one of XS, S, M, L, XL, XXL"
                })
            }
            if (sizeObj.stock === undefined || sizeObj.stock < 0) {
                errors.push({
                    field: `sizes[${index}].stock`,
                    message: "Stock must be a positive number"
                })
            }
        })
    }

}