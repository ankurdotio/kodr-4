import productModel from "../models/product.model.js"
import uploadFile from "../services/storage.service.js"

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