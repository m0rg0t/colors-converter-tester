import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => ({
  resolve: { alias: command === 'serve' && mode === 'vk-mock'
    ? [{ find: /^@vkontakte\/vk-bridge$/, replacement: fileURLToPath(new URL('./src/test/vkBridgeRuntimeMock.js', import.meta.url)) }] : [] },
  plugins: [react()],
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
}))
