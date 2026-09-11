import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    address: {
        state: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        street: {
            type: String,
            required: true
        },
        house: {
            type: String,
            required: true
        },
        zip: {
            type: String,
            required: true
        }
    },
    products: [
        {
            product: {
                title: {
                    type: String,
                    required: true
                },
                description: {
                    type: String,
                    required: true
                },
                price: {
                    amount: {
                        type: Number,
                        required: true
                    },
                    currency: {
                        type: String,
                        required: true
                    }
                },
                image: {
                    type: String,
                    required: true
                },
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true
                }
            },
            quantity: {
                type: Number,
                required: true
            },
            size: {
                type: String,
                required: true
            }
        }
    ],
    totalPrice: {
        amount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            required: true
        }
    },
    status: {
        type: String,
        required: true,
        enum: [ "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED" ]
    }
})

const orderModel = mongoose.model("Order", orderSchema)

export default orderModel   