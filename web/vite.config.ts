import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
      '/chatbot_api.php': 'http://localhost:8000',
      '/mail.php': 'http://localhost:8000',
      '/uploads': 'http://localhost:8000',
      // NOTE: /img is intentionally NOT proxied — product/marketing images
      // are static frontend assets served from web/public/img/, not backend
      // content (unlike /uploads, which holds user-uploaded profile pictures).
    },
  },
})
