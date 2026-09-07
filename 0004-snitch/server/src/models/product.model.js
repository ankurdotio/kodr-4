import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 100
    },
    description: {
        type: String,
        required: true,
        minLength: 10,
        maxLength: 1000
    },
    price: {
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            required: true,
            enum: [ "USD", "EUR", "CAD", "INR" ],
            default: "INR"
        }
    },
    categories: [
        {
            type: String,
            required: true
        }
    ],
    images: [
        {
            imagekitId: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            },
            order: {
                type: Number,
                required: true
            }
        }
    ],
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    sizes: [
        {
            size: {
                type: String,
                required: true,
                enum: [ "XS", "S", "M", "L", "XL", "XXL" ]
            },
            stock: {
                type: Number,
                required: true,
                min: 0
            }
        }
    ],
    isPublished: {
        type: Boolean,
        required: true,
        default: false
    }
},
    {
        timestamps: true
    }
)

const productModel = mongoose.model("products", productSchema)

export default productModel