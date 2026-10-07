import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router'

const Join = () => {

    const navigate = useNavigate()
    const [ name, setName ] = useState('')

    async function handleSubmit(event) {
        event.preventDefault()

        const response = await axios.post("/api/chat/join", { name })

        const token = response.data.token
        localStorage.setItem("token", token)
        navigate("/chat")
    }

    return (
        <main>
            <h1>Join Page</h1>
            <form onSubmit={handleSubmit}>
                <input
                    value={name}
                    onChange={(e) => { setName(e.target.value) }}
                    type="text" placeholder="Enter your name" />
                <button type="submit">Join</button>
            </form>
        </main>
    )
}

export default Join