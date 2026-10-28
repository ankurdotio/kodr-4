import './App.css'
import api from "../api/api"

function App() {

  async function checkServerHealth() {
    try {
      const response = await api.get("/health")
      console.log(response.data)
    } catch (error) {
      console.error("Server health check failed:", error)
    }
  }

  return (
    <>
      <button
        className='bg-blue-500 text-white px-4 py-2 rounded'
        onClick={checkServerHealth}>Check Server Health</button>
    </>
  )
}

export default App
