import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'  // Tell Vite to output to the "dist" folder for Vercel
  },
  server: {
    proxy: {
      "/api": "http://localhost:3001"
    }
  }
})
