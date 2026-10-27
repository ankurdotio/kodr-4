import express from "express";
import connectDB from "./config/db.js";
import { config } from "dotenv";

config();

console.log(process.env.RANDOM);

const app = express();

connectDB();

app.get("/", (req, res) => {
    res.json({ message: "Hello, world!" });
});

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.get("/about", (req, res) => {
    res.json({ message: "This is the about page." });
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
})

