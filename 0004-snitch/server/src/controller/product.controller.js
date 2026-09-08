import productModel from "../models/product.model.js"
import { uploadFile } from "../services/storage.service.js"

export async function createProduct(req, res) {

    const user = req.user

    if (user.role !== "seller") {
        return res.status(403).json({
            message: "Only sellers can create products"
        })
    }

    const { title, description, price: { amount, currency }, categories, sizes } = req.body

    const errors = []

    const files = req.files

    if (!files || files.length === 0) {
        errors.push({
            field: "images",
            message: "At least one image is required"
        })
    }

    if (errors.length > 0) {
        return res.status(400).json({
            errors
        })
    }


    const urls = await Promise.all(req.files.map(async (file, index) => {

        const fileName = `${Date.now()}-${file.originalname}`

        const response = await uploadFile(file.buffer.toString("base64"), fileName)

        return {
            url: response.url,
            imagekitId: response.fileId,
            order: index + 1,
        }

    }))

    const product = await productModel.create({
        title,
        description,
        price: {
            amount,
            currency
        },
        categories,
        images: urls,
        seller: user.id,
        sizes
    })

    return res.status(201).json({
        message: "Product created successfully",
        data: {
            product: {
                id: product._id,
                title: product.title,
                description: product.description,
                price: product.price,
                categories: product.categories,
                images: product.images,
                seller: product.seller,
                sizes: product.sizes,
                isPublished: product.isPublished
            }
        }
    })

}

export async function updateProduct(req, res) {

    const user = req.user

    if (user.role !== "seller") {
        return res.status(403).json({
            message: "Only sellers can update products"
        })
    }

    const { id } = req.params

    const product = await productModel.findOne({
        _id: id,
    })

    if (!product) {
        return res.status(404).json({
            message: "Product not found"
        })
    }

    if (product.seller.toString() !== user.id) {
        return res.status(403).json({
            message: "You are not authorized to update this product"
        })
    }

    const numberOfImages = product.images.length + (req.files ? req.files.length : 0)

    if (numberOfImages > 5) {
        return res.status(400).json({
            message: "You can upload a maximum of 5 images"
        })
    }

    if (req.files && req.files.length > 0) {
        const urls = await Promise.all(req.files.map(async (file, index) => {

            const fileName = `${Date.now()}-${file.originalname}`
            const response = await uploadFile(file.buffer.toString("base64"), fileName)

            return {
                url: response.url,
                imagekitId: response.fileId,
                order: product.images.length + index + 1,
            }
        }))

        product.images.push(...urls)
    }

    const { title, description, price, categories, sizes } = req.body

    if (title) product.title = title
    if (description) product.description = description
    if (price) product.price = price
    if (categories) product.categories = categories
    if (sizes) product.sizes = sizes

    await product.save()

    return res.status(200).json({
        message: "Product updated successfully",
        data: {
            product: {
                id: product._id,
                title: product.title,
                description: product.description,
                price: product.price,
                categories: product.categories,
                images: product.images,
                seller: product.seller,
                sizes: product.sizes,
                isPublished: product.isPublished
            }
        }
    })

}