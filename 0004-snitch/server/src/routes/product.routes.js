import { Router } from "express";
import authenticate from "../middlewares/auth.middleware.js"
import { createProduct } from "../controller/product.controller.js"
import multer from "multer"

const upload = multer({
    storage: multer.memoryStorage(),
})



const router = Router();


/**
 * @POST /api/products
 */
router.post("/", authenticate, upload.array("images", 5), createProduct)

export default router;