import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import bridge from '@vkontakte/vk-bridge'
import './index.css'
import App from './App.jsx'

// Initialize VK Bridge — silently fails outside VK WebView
try {
  bridge.send('VKWebAppInit')
} catch {
  // Running standalone, not inside VK
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
