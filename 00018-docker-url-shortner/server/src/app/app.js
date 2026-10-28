import express from "express"
import morgan from "morgan"
import indexRoutes from "../routes/index.routes.js"
const app = express()


app.use(morgan("dev"))
app.use(express.json())

app.get("/api/health", (req, res) => {
    res.status(200).json({
        message: "Server healthy"
    })
})

app.use("/api", indexRoutes)


export default app