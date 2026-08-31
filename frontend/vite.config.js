import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const pdfPackages = [
  'jspdf',
  'html2canvas',
  'dompurify',
  'canvg',
  'fflate',
  'fast-png',
  'iobuffer',
  'pako',
  'rgbcolor',
  'core-js',
  'css-line-break',
  'text-segmentation',
  'utrie',
  'raf',
  'regenerator-runtime',
  'stackblur-canvas',
  'svg-pathdata',
  'base64-arraybuffer',
]

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Evita que Lighthouse descargue/pre-cargue chunks de rutas que no se usan en la primera vista.
    modulePreload: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('preload-helper') || id.includes('modulepreload')) return 'preload-helper'
          if (!id.includes('node_modules')) return undefined
          if (pdfPackages.some((pkg) => id.includes(`/node_modules/${pkg}/`))) return 'pdf-vendor'
          if (id.includes('lucide-react')) return 'icons-vendor'
          if (id.includes('react-router')) return 'router-vendor'
          if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
            return 'react-vendor'
          }
          return 'vendor'
        },
      },
    },
  },
})
