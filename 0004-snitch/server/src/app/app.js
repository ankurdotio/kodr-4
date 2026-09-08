import express from "express"
import morgan from "morgan"
import authRoutes from "../routes/auth.routes.js"
import productRoutes from "../routes/product.routes.js"



const app = express()
app.use(morgan("dev"))
app.use(express.json())


app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)

export default app