import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Match branding.ts: default to syndicate unless the brand is explicitly 'daily'.
const brandTitle = process.env.VITE_BRAND_MODE === 'daily' ? 'Who Is Lying?' : 'The Syndicate';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'brand-index-html',
      transformIndexHtml(html) {
        return html.replace('__BRAND_TITLE__', brandTitle);
      },
    },
  ],
});
