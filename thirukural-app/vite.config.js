import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Ensure JSON files in src/data can be dynamically imported
  assetsInclude: [],
  build: {
    rollupOptions: {
      output: {
        // Split each athigaram JSON into its own chunk for lazy loading
        manualChunks: undefined,
      },
    },
  },
})
