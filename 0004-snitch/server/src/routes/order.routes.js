import { Router } from "express"
import authenticate from "../middlewares/auth.middleware.js"
import { createOrder } from "../controller/order.controller.js"
import { createOrderValidator } from "../validator/order.validator.js"


const router = Router()


router.use(authenticate)

/**
 * @POST /api/orders
 */
router.post("/", createOrderValidator, createOrder)

export default router