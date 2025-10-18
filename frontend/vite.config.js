import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: 'popup.html',
        //Link to the new content script
        'contentScript': 'src/contentScript.jsx',
      },
      output: {
        entryFileNames: '[name].js',
      }
    }
  },
  base: './'
})

