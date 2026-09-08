import userModel from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import config from '../config/config.js'
import bcrypt from 'bcryptjs'




export async function register(req, res) {

    const { name, email, password } = req.body

    const isUserExists = await userModel.findOne({
        email
    })

    if (isUserExists) {
        return res.status(400).json({
            message: "User already exists",
            errors: [
                {
                    message: "User already exists",
                    field: "email"
                }
            ]
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        name,
        email,
        passwordHash: hashedPassword
    })

    const token = jwt.sign({
        id: user._id,
        role: user.role
    }, config.JWT_SECRET)

    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        },
        token
    })


}

export async function login(req, res) {

    const { email, password } = req.body

    const user = await userModel.findOne({ email }).select("+passwordHash")

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password",
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password",
        })
    }

    const token = jwt.sign({
        id: user._id,
        role: user.role
    }, config.JWT_SECRET)


    res.status(200).json({
        message: "User logged in successfully",
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        },
        token
    })

}

export async function getMe(req, res) {

    try {

        const user = await userModel.findById(req.user.id)

        return res.status(200).json({
            message: "User fetched successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })

    } catch (err) {
        res.status(401).json({
            message: "Invalid or expired token"
        })
    }
}