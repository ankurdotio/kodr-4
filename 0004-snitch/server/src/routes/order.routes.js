import { Router } from "express"
import authenticate from "../middlewares/auth.middleware.js"
import { createOrder, getOrders, cancelOrder, updateOrderStatus } from "../controller/order.controller.js"
import { createOrderValidator } from "../validator/order.validator.js"


const router = Router()


router.use(authenticate)

/**
 * @POST /api/orders
 */
router.post("/", createOrderValidator, createOrder)

/**
 * @GET /api/orders
 */
router.get("/", getOrders)

/**
 * @PATCH /api/orders/cancel/:orderid
 */
router.patch("/cancel/:orderid", cancelOrder)


/**
 * @PATCH /api/orders/status/:orderid
 */
router.patch("/status/:orderid", updateOrderStatus)


export default router