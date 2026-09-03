import { Router } from "express"
import userModel from "../models/user.model.js"
import jwt from "jsonwebtoken"
import config from "../config/config.js"


const router = Router();

router.post("/register", async (req, res) => {

    const { email, name, password } = req.body;


    const user = await userModel.create({
        email,
        name,
        passwordHash: password
    })

    const token = jwt.sign(
        {
            id: user._id
        },
        config.JWT_SECRET
    )

    res.status(201).json({
        message: "User registered successfully",
        data: {
            user: {
                email: user.email,
                name: user.name,
            },
        },
        token: token
    })

})


/**
 * /api/auth/me
 */
router.get("/me", async (req, res) => {


    const token = req.headers.authorization

    const data = jwt.verify(token, config.JWT_SECRET)

    console.log(data)

    const user = await userModel.findById(data.id)

    res.status(200).json({
        message: "user data fetched successfully",
        data: {
            user: {
                email: user.email,
                name: user.name,
            }
        }
    })

})



export default router;