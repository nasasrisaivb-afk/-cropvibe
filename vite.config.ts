import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Repo: nasasrisaivb-afk/-cropvibe → Pages URL uses this base path
// Local/dev uses `/`. CI sets VITE_BASE_PATH for GitHub Pages.
const repoBase = process.env.VITE_BASE_PATH ?? '/'

// https://vite.dev/config/
export default defineConfig({
  base: repoBase,
  plugins: [react(), tailwindcss()],
})
