import mongoose from "mongoose";


const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    products: [ {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "products",
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        size: {
            type: String,
            required: true,
            enum: [ "XS", "S", "M", "L", "XL", "XXL" ]
        }
    } ]
})

const cartModel = mongoose.model("carts", cartSchema)

export default cartModel;