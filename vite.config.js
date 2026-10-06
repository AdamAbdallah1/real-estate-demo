import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/demo/nara-realestate/',
  build: {
    outDir: 'dist/demo/nara-realestate',
    emptyOutDir: true
  }
})
