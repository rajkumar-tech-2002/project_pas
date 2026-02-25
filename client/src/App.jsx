import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes.jsx'

import { Toaster } from './components/ui/sonnar.jsx'

function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
            <Toaster />
        </BrowserRouter>
    )
}

export default App
