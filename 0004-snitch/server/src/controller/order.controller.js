import orderModel from "../models/order.model.js"
import cartModel from "../models/cart.model.js"

export const createOrder = async (req, res) => {

    const user = req.user

    const cart = await cartModel.findOne({
        user: user.id
    }).populate("products.product")

    if (!cart) {
        return res.status(400).json({
            message: "Cart is empty"
        })
    }

    if (cart.products.length === 0) {
        return res.status(400).json({
            message: "Cart is empty"
        })
    }

    const publishedProducts = cart.products.filter(p => p.product.isPublished)

    if (publishedProducts.length !== cart.products.length) {
        return res.status(400).json({
            message: "Some products in the cart are not published yet"
        })
    }

    const sizeErrors = []
    cart.products.forEach(p => {
        const productSize = p.size

        const size = p.product.sizes.find(s => {
            return s.size === productSize
        })

        if (!size) {
            sizeErrors.push({
                product: p.product._id,
                message: `Size ${productSize} is not available for this product`
            })
            return
        }

        const isStockAvailable = size.stock >= p.quantity

        if (!isStockAvailable) {
            sizeErrors.push({
                product: p.product._id,
                message: `Only ${size.stock} items available for size ${productSize}`
            })
            return
        }
    })

    if (sizeErrors.length > 0) {
        return res.status(400).json({
            message: "Some products have size or stock issues",
            errors: sizeErrors
        })
    }

}