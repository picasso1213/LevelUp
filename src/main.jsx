import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Solo el CSS de Bootstrap: los componentes interactivos los aporta React Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/levelup.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
