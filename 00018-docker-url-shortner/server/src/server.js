import app from "./app/app.js"
import connectToDB from "./config/db.js"
import "./config/redis.js"


await connectToDB()

app.listen(3000, () => {
    console.log("server is running on port 3000")
})