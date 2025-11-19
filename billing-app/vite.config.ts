import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main.ts',
        vite: {
          build: {
            outDir: 'dist-electron/main',
            rollupOptions: {
              external: ['electron'],
              output: {
                entryFileNames: 'index.js'
              }
            }
          }
        }
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          // Notify the renderer process to reload the page when the preload scripts build is complete
          options.reload()
        },
        vite: {
          build: {
            outDir: 'dist-electron/preload',
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      }
    ]),
    renderer()
  ]
})
