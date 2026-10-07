import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io"

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer);


io.on("connection", (socket) => {

    console.log("A user connected");

    socket.on("elon", (data) => {
        console.log("Elon event received");
        console.log(data);

        socket.broadcast.emit("musk", {
            "some_data_from_server": "Hello from server"
        })

        socket.to("ritu's socket id").emit("musk", {
            "some_data_from_server": "Hello from server"
        })
    })
})

httpServer.listen(3000, () => {
    console.log("Server is listening on port 3000");
})