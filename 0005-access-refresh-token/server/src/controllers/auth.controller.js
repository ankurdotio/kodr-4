import userModel from "../models/user.model.js"
import sessionModel from "../models/session.model.js"
import bcrypt from "bcryptjs"
import { generateTokens } from "../utils/auth.utils.js"


export async function register(req, res) {

    const { name, email, password } = req.body;

    const user = await userModel.create({
        email: email,
        name: name,
        password: await bcrypt.hash(password, 12)
    })

    const tokens = generateTokens(user._id)

    await sessionModel.create({
        user: user._id,
        refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 12)
    })

    res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    })

    res.status(201).json({
        message: "User registered successfully",
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            accessToken: tokens.accessToken
        }
    })

}


export async function login(req, res) {

    const { email, password } = req.body;

    const user = await userModel.findOne({
        email: email
    })

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const tokens = generateTokens(user._id)

    await sessionModel.findOneAndUpdate(
        { userId: user._id },
        { refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 12) },
        { upsert: true }
    )

    res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    })

    res.status(200).json({
        message: "User logged in successfully",
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
            accessToken: tokens.accessToken
        }
    })

}