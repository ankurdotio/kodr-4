import orderModel from "../models/order.model.js"
import cartModel from "../models/cart.model.js"
import productModel from "../models/product.model.js"

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

    await productModel.bulkWrite(
        cart.products.map(product => {
            return {
                updateOne: {
                    filter: {
                        _id: product.product._id,
                        "sizes.size": product.size
                    },
                    update: {
                        $inc: {
                            "sizes.$.stock": -product.quantity
                        }
                    }
                }
            }
        })
    )

    const order = await orderModel.create({
        user: user.id,
        address: req.body.address,
        products: cart.products.map(product => {
            return {
                product: {
                    title: product.product.title,
                    description: product.product.description,
                    price: product.product.price,
                    image: product.product.images[ 0 ]?.url ?? "",
                    productId: product.product._id
                },
                quantity: product.quantity,
                size: product.size
            }
        }),
        totalPrice: {
            amount: cart.products.reduce((total, product) => {
                return total + product.product.price.amount * product.quantity
            }, 0),
            currency: "INR"
        }
    })

    return res.status(201).json({
        message: "Order placed successfully",
        data: {
            order
        }
    })

}

export const getOrders = async (req, res) => {
    const user = req.user


    const orders = await orderModel.find({
        user: user.id
    }).sort({ createdAt: -1 })

    return res.status(200).json({
        message: "Orders retrieved successfully",
        data: {
            orders
        }
    })
}

export const cancelOrder = async (req, res) => {
    const user = req.user
    const { orderid } = req.params


    const order = await orderModel.findOne({
        _id: orderid
    })

    if (!order) {
        return res.status(404).json({
            message: "Order not found"
        })
    }

    if (order.user.toString() !== user.id) {
        return res.status(403).json({
            message: "You are not authorized to cancel this order"
        })
    }

    if (order.status == "CANCELLED") {
        return res.status(400).json({
            message: "Order is already cancelled"
        })
    }

    if ([ "DELIVERED", "SHIPPED" ].includes(order.status)) {
        return res.status(400).json({
            message: "Order cannot be cancelled as it is already " + order.status.toLowerCase()
        })
    }

    await orderModel.updateOne(
        { _id: orderid },
        { $set: { status: "CANCELLED" } }
    )

    return res.status(200).json({
        message: "Order canceled Successfully"
    })

}

export const updateOrderStatus = async (req, res) => {

    const user = req.user

    if (user.role !== "seller") {
        return res.status(403).json({
            message: "You are not authorized to update the order status"
        })
    }

    const { status } = req.body
    const orderid = req.params.orderid

    const order = await orderModel.findOne({
        _id: orderid
    })

    if (status == "PLACED") {

        if ([ "CANCELLED", "DELIVERED", "SHIPPED" ].includes(order.status)) {
            return res.status(400).json({
                message: "Order status cannot be changed to PLACED as it is already " + order.status.toLowerCase()
            })
        }

        await orderModel.updateOne(
            { _id: orderid },
            { $set: { status: "PLACED" } }
        )
    }

    if (status == "SHIPPED") {
        if ([ "CANCELLED", "DELIVERED" ].includes(order.status)) {
            return res.status(400).json({
                message: "Order status cannot be changed to SHIPPED as it is already " + order.status.toLowerCase()
            })
        }

        await orderModel.updateOne(
            { _id: orderid },
            { $set: { status: "SHIPPED" } }
        )
    }

    if (status == "DELIVERED") {
        if ([ "CANCELLED" ].includes(order.status)) {
            return res.status(400).json({
                message: "Order status cannot be changed to DELIVERED as it is already " + order.status.toLowerCase()
            })
        }

        await orderModel.updateOne(
            { _id: orderid },
            { $set: { status: "DELIVERED" } }
        )
    }

    return res.status(200).json({
        message: "Order status updated successfully"
    })
}


