import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // En desarrollo, redirige /api al backend local
  server: { proxy: { '/api': 'http://localhost:3001' } },
})
