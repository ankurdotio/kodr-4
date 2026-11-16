import express from "express"
import morgan from "morgan"
import axios from "axios"

const app = express()
app.use(express.json())
app.use(morgan("dev"))




app.get("/api/payment/", (req, res) => {
    res.status(200).send("Payment endpoint")
})

app.post("/api/payment/verify", async (req, res) => {
    // Handle payment verification logic here
    const { paymentId, userId } = req.body
    console.log(`Verifying payment ${paymentId} for user ${userId}`)

    await axios.post("http://course:3001/api/course/enroll", {
        courseId: paymentId,
        userId: userId
    })

    console.log(`Payment ${paymentId} verified for user ${userId}`)

    res.status(200).json({
        message: `Payment ${paymentId} verified for user ${userId}`
    })
})



app.listen(3000, () => {
    console.log("Server is running on port 3000")
})