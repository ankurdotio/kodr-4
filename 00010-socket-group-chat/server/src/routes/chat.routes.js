import { Router } from "express"
import jwt from "jsonwebtoken"
import { users } from "../sockets/server.socket.js"


const router = Router()


router.post("/join", (req, res) => {
    const { name } = req.body
    if (!name) {
        return res.status(400).json({ error: "Name is required" })
    }
    if (typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ error: "Name must be a non-empty string" })
    }

    const token = jwt.sign({ name }, process.env.JWT_SECRET)

    res.status(200).json({ token })

})

router.get("/users", (req, res) => {
    res.status(200).json({ users })
})


export default router