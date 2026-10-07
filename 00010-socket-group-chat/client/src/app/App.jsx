import { RouterProvider } from 'react-router'
import { routes } from './app.routes.jsx'
import './App.css'

function App() {


  return (
    <RouterProvider router={routes} />
  )
}

export default App
