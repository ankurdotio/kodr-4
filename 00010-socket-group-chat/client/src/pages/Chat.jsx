import React, { useState, useEffect } from 'react'
import { initializeSocket, listenToOnlineEvent, listenToOfflineEvent, listenToMessageEvent, emitMessage } from "../sockets/index.socket"
import axios from "axios"


const Chat = () => {
    const [ users, setUsers ] = useState([])
    const [ messages, setMessages ] = useState([])
    const [ message, setMessage ] = useState("")

    async function fetchUsers() {
        const response = await axios.get("/api/chat/users")
        setUsers(response.data.users)
    }
    
    useEffect(() => {
        fetchUsers()
        initializeSocket(localStorage.getItem("token"))
        listenToOnlineEvent((user) => {
            setUsers((prevUsers) => [ ...prevUsers, user.name ])
        })
        listenToOfflineEvent((user) => {
            setUsers((prevUsers) => prevUsers.filter((u) => u !== user.name))
        })

        listenToMessageEvent((message) => {
            setMessages((prevMessages) => [ ...prevMessages, message ])
        })

    }, [])

    const handleSendMessage = () => {
        if (message.trim() === "") return
        emitMessage(message)
        setMessages((prevMessages) => [
            ...prevMessages,
            { name: "Me", message }
        ])
        setMessage("")
    }

    return (
        <main className='w-screen h-screen flex p-4 gap-2' >
            <section className='h-full w-8/12 bg-gray-100 rounded-md p-2' >
                {messages.map((msg, index) => (
                    <div className='bg-gray-200 p-2 rounded-md w-fit' key={index}>
                        <strong>{msg.name}:</strong> {msg.message}
                    </div>
                ))}
                <div
                    className="input-area"
                >
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSendMessage()
                            }
                        }}
                    />
                    <button onClick={handleSendMessage} >
                        send
                    </button>
                </div>
            </section>
            <aside className='h-full w-4/12' >
                <h2>online Users</h2>
                <ul className='list-disc list-inside'>
                    {users.map((user, index) => (
                        <li key={index}>{user}</li>
                    ))}
                </ul>
            </aside>
        </main>
    )
}

export default Chat