import { Router } from "express"
import authenticate from "../middlewares/auth.middleware.js";
import { addToCartValidator, removeFromCartValidator } from "../validator/cart.validator.js"
import { addProductToCart, removeProductFromCart } from "../controller/cart.controller.js"


const router = Router()

router.use(authenticate)

/**
 * @POST /api/cart/add/product/:productId
 */
router.post('/add/product/:productId', addToCartValidator, addProductToCart)


/**
 * @DELETE /api/cart/remove/product/:productId
 */
router.delete("/remove/product/:productId", removeFromCartValidator, removeProductFromCart)


/**
 * @GET /api/cart
 */
router.get("/",)

export default router;