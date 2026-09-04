import { Router } from "express"
import { register } from "../controller/auth.controller.js"


const router = Router()

router.post("/register", register)




export default router