import { Router } from "express"
import { register, login, getMe } from "../controller/auth.controller.js"
import authenticate from "../middlewares/auth.middleware.js"
import { registerValidator, loginValidator } from "../validator/auth.validator.js"


const router = Router()

router.post("/register", registerValidator, register)

router.post("/login", loginValidator, login)


router.get("/me", authenticate, getMe)




export default router