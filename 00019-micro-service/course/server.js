import express from "express"
import morgan from "morgan"

const app = express()
app.use(express.json())
app.use(morgan("dev"))



app.get("/api/course/", (req, res) => {
    res.status(200).send("Course endpoint")
})

app.post("/api/course/enroll", (req, res) => {
    const { courseId, userId } = req.body

    console.log(`Enrolling user ${userId} in course ${courseId}`)
    
    res.status(200).json({
        message: `User ${userId} enrolled in course ${courseId}`
    })
})


app.listen(3001, () => {
    console.log("Server is running on port 3001")
})