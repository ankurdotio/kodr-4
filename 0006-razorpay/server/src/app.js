import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import routes from "./routes/index.routes.js";
import { notFound } from "./middleware/notFound.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { env } from "./config/env.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.use("/api/v1", routes);

app.use(notFound);
app.use(errorHandler);

export default app;
