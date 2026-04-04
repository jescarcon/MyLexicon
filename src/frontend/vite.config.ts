import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/mylexicon/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // HMR (Hot Module Replacement) a través de Apache
    hmr: {
      host: 'jescarcon.ddns.net',
      protocol: 'ws',
      clientPort: 80, 
      path: 'socket.io'
    },
  },
})
