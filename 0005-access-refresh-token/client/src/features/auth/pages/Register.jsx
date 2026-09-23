import React, { useState } from 'react'
import axios from 'axios'
import { useDispatch } from 'react-redux';
import { setUser, setAccessToken } from '../state/auth.slice';
import { useNavigate } from 'react-router';

const Register = () => {

    const [ name, setName ] = useState('');
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();

    async function handleSubmit(event) {
        event.preventDefault();

        const response = await axios.post("http://localhost:5173/api/auth/register", {
            name: name,
            email: email,
            password: password
        })

        const data = response.data.data

        dispatch(setUser(data.user));
        dispatch(setAccessToken(data.accessToken));

        navigate("/me");
    }

    return (
        <main>
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text" placeholder="Name" />
                <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email" placeholder="Email" />
                <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password" placeholder="Password" />
                <button type="submit">Register</button>
            </form>
        </main>
    )
}

export default Register