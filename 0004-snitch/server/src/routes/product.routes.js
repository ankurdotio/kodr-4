import { Router } from "express";
import authenticate from "../middlewares/auth.middleware.js"


const router = Router();


/**
 * @POST /api/products
 */
router.post("/", authenticate)

export default router;