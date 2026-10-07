import { io } from "socket.io-client"

let socket = null

export function initializeSocket(token) {
    socket = io("http://localhost:5173", {
        extraHeaders: {
            token: token
        }
    })
}

export function listenToOnlineEvent(callback) {
    socket.on("online", callback)
}

export function listenToOfflineEvent(callback) {
    socket.on("offline", callback)
}

export function listenToMessageEvent(callback) {
    socket.on("message", callback)
}

export function emitMessage(message) {
    socket.emit("message", message)
}