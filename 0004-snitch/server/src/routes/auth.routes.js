import { Router } from "express"
import { register, login, getMe } from "../controller/auth.controller.js"
import authenticate from "../middlewares/auth.middleware.js"


const router = Router()

router.post("/register", register)

router.post("/login", login)


router.get("/me", authenticate, getMe)




export default router