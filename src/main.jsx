import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import bridge from '@vkontakte/vk-bridge'
import './index.css'
import App from './App.jsx'

// Initialize VK Bridge — silently fails outside VK WebView
try {
  void bridge.send('VKWebAppInit').catch(() => { /* Standalone use remains available. */ })
} catch {
  // Running standalone, not inside VK
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
