import express from "express"
import morgan from "morgan"

const app = express()


app.use(morgan("dev"))
app.use(express.json())

app.get("/api/health", (req, res) => {
    res.status(200).json({
        message: "Server healthy"
    })
})


export default app