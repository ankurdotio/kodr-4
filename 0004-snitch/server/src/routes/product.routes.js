import { Router } from "express";
import authenticate from "../middlewares/auth.middleware.js"
import { createProduct } from "../controller/product.controller.js"
import { createProductValidator } from "../validator/product.validate.js"
import multer from "multer"

const upload = multer({
    storage: multer.memoryStorage(),
})



const router = Router();


/**
 * @POST /api/products
 */
router.post("/", authenticate, upload.array("images", 5), createProductValidator, createProduct)

export default router;