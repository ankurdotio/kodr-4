import userModel from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import config from '../config/config.js'
import bcrypt from 'bcryptjs'

export async function register(req, res) {

    const { name, email, password } = req.body

    const errors = []

    if (!name) {
        errors.push({
            message: "Name is required",
            field: "name"
        })
    }

    if (name?.length < 3) {
        errors.push({
            message: "Name must be at least 3 characters long",
            field: "name"
        })
    }

    if (!email) {
        errors.push({
            message: "Email is required",
            field: "email"
        })
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push({
            message: "Email is not valid",
            field: "email"
        })
    }

    if (!password) {
        errors.push({
            message: "Password is required",
            field: "password"
        })
    }

    if (password?.length < 6) {
        errors.push({
            message: "Password must be at least 6 characters long",
            field: "password"
        })
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "Validation errors",
            errors: errors
        })
    }


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
        password: hashedPassword
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