import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: './', // Menghasilkan path relatif agar asset terbaca sempurna di GitHub Pages
  plugins: [
    react(),
    tailwindcss(),
  ],
})
