import { Router } from "express";
import authenticate from "../middlewares/auth.middleware.js"
import { createProduct, updateProduct } from "../controller/product.controller.js"
import { createProductValidator, updateProductValidator } from "../validator/product.validate.js"
import multer from "multer"

const upload = multer({
    storage: multer.memoryStorage(),
})



const router = Router();


/**
 * @POST /api/products
 */
router.post("/",
    authenticate,
    upload.array("images", 5),
    (req, res, next) => {

        console.log("req.body", req.body)
        console.log(req.body.sizes)

        if (req.body.sizes) {
            req.body.sizes = JSON.parse(req.body.sizes)
        }

        if (req.body.categories) {
            req.body.categories = JSON.parse(req.body.categories)
        }

        if (req.body.price) {
            req.body.price = JSON.parse(req.body.price)
        }

        next()
    },
    createProductValidator,
    createProduct)


/**
 * @PATCH /api/products/update/:id
 */
router.patch("/update/:id",
    authenticate,
    upload.array("images", 5),
    (req, res, next) => {

        console.log("req.body", req.body)
        console.log(req.body.sizes)

        if (req.body.sizes) {
            req.body.sizes = JSON.parse(req.body.sizes)
        }

        if (req.body.categories) {
            req.body.categories = JSON.parse(req.body.categories)
        }

        if (req.body.price) {
            req.body.price = JSON.parse(req.body.price)
        }

        next()
    },
    updateProductValidator,
    updateProduct
)

/**
 * @DELETE /api/products/image/:id/:imageId
 */

export default router;