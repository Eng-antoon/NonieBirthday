import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  base: '/NonieBirthday/',
  build: {
    outDir: 'dist',
    target: 'es2015',
    rollupOptions: {
      input: {
        main: './index.html',
        upload: './upload.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})