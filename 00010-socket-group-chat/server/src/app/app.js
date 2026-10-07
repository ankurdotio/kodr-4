import express from "express"
import chatRoutes from "../routes/chat.routes.js" 
const app = express()

app.use(express.json())


app.use("/api/chat", chatRoutes)

export default app