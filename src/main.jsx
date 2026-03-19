import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SymptomProvider } from './context/SymptomContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SymptomProvider>
      <App />
    </SymptomProvider>
  </StrictMode>,
)
