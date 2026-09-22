import express from "express";
import cookieParser from "cookie-parser"
import morgan from "morgan";
import authRoutes from "../routes/auth.routes.js"

const app = express();


app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));


// –––––––––––––––––––––––– routes ––––––––––––––––––––––––
app.use("/api/auth", authRoutes);

export default app;