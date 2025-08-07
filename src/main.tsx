import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './globals.css'
import './lib/chartSetup' // Import chart setup globally
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
