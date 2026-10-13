import { defineConfig } from 'vite'

// GitHub Pages serves the site from /<repo-name>/, so production builds (and
// `npm run preview` of them) need that base path. `npm run dev` serves from /.
export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? '/stock-portfolio-visualizer/' : '/',
}))
