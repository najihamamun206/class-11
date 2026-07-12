import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/class-11/', // 👈 Add this line
  plugins: [react()],
  server: {
    proxy: {
      '/upload': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
})