import React from 'react'
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import axios from "axios"
import { useDispatch } from 'react-redux';
import { setUser, setAccessToken } from "../state/auth.slice"





const Me = () => {

    const user = useSelector((state) => state.auth.user);
    const accessToken = useSelector((state) => state.auth.accessToken);

    const dispatch = useDispatch();

    const api = axios.create({
        withCredentials: true,
    })

    api.interceptors.request.use(
        config => {
            config.headers.Authorization = `Bearer ${accessToken}`;
            return config;
        }
    )

    api.interceptors.response.use(
        res => res,
        async (error) => {
            if (error.response.status == 401) {
                const response = await axios.post("http://localhost:5173/api/auth/refresh", {
                    withCredentials: true
                })

                const data = response.data.data
                dispatch(setAccessToken(data.accessToken))

                error.config.headers.Authorization = `Bearer ${data.accessToken}`;

                return axios(error.config)
            }

        }
    )

    async function fetchMe() {

        const response = await api.get("http://localhost:5173/api/auth/me")

    }

    useEffect(() => {
        fetchMe();
    }, []);

    return (
        <div>Me</div>
    )
}

export default Me