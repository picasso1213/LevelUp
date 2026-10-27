import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   test: {
    environment: 'jsdom',            // simula un navegador
    globals: true,                   // permite usar describe/it/expect sin importarlos
    setupFiles: './src/test/setup.js',
    css: false,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx', 'src/test/**', 'src/**/*.test.{js,jsx}', 'src/data/**'],
      reporter: ['text', 'html'],
    },
  },

})
