import { useState } from 'react'
import { RouterProvider } from 'react-router'
import { router } from './app.routes'
import { Provider } from 'react-redux'
import { store } from './app.store'

import './App.css'

function App() {


  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  )
}

export default App
