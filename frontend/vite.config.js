import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'nexxt-mantrix.cloudmantra.ai',
      'madisonreed.cloudmantra.ai',
      'drinkaz-mantrix.cloudmantra.ai',
      'drinkaz-axis.cloudmantra.ai',
      'demo-axis.cloudmantra.ai'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/superset': {
        target: 'http://localhost:8088',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/superset/, ''),
      }
    }
  }
})