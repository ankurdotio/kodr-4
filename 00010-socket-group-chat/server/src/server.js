import app from "./app/app.js"
import "dotenv/config"
import { createServer } from "node:http"
import initializeSocket from "./sockets/server.socket.js"

const httpServer = createServer(app)

initializeSocket(httpServer)

httpServer.listen(3000, () => {
    console.log("Server is listening on port 3000")
})