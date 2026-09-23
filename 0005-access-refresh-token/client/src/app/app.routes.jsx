import { createBrowserRouter } from 'react-router'
import Register from "../features/auth/pages/Register"
import Login from "../features/auth/pages/Login"
import Me from "../features/auth/pages/Me"



export const router = createBrowserRouter([
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/me",
        element: <Me />
    }
])