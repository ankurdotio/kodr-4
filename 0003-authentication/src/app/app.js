import express from "express";
import morgan from "morgan";
import authRouter from "../router/auth.routes.js"

const app = express();

app.use(express.json());
app.use(morgan("dev"));


app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Server is healthy"
    })
})


app.use("/api/auth", authRouter)



export default app;