import { Router } from "express"
import { registerValidator, loginValidator } from "../validator/auth.validator.js"
import { register,login } from "../controllers/auth.controller.js"


const router = Router()


/**
 * @method POST
 * @route /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post("/register", registerValidator, register)



/**
 * @method POST
 * @route /api/auth/login
 * @desc Login a user
 * @access Public
 */
router.post("/login", loginValidator, login)


export default router