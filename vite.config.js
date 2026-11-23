import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => {
  // Embarko and most static hosts serve the app at the domain root. GitHub
  // Pages sets VITE_BASE_PATH=/philosophia/ in its workflow instead.
  const base = process.env.VITE_BASE_PATH || '/'
  const siteUrl = process.env.SITE_URL
    || (base === '/philosophia/' ? 'https://glint-hk.github.io/philosophia/' : 'https://philosophia-atlas.embarko.app/')

  return {
    plugins: [
      react(),
      {
        name: 'philosophia-site-url',
        transformIndexHtml(html) {
          return html.replaceAll('__SITE_URL__', siteUrl.replace(/\/?$/, '/'))
        },
      },
    ],
    base,
  }
})
