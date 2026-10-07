import { Server } from "socket.io"
import jwt from "jsonwebtoken"
let users = []

function initializeSocket(httpServer) {

    const io = new Server(httpServer)

    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id)

        const token = socket.handshake.headers.token
        const user = jwt.verify(token, process.env.JWT_SECRET)

        socket.broadcast.emit("online", user)

        users.push(user.name)

        socket.on("disconnect", () => {
            socket.broadcast.emit("offline", user)
            users = users.filter((u) => u !== user.name)
        })

        socket.on("message", (message) => {
            // message = string sent by the client
            socket.broadcast.emit("message", {
                name: user.name,
                message: message
            })
        })
    })

    return io
}
export { users }
export default initializeSocket