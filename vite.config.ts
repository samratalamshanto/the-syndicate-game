import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const brandTitle = process.env.VITE_BRAND_MODE === 'syndicate' ? 'The Syndicate' : 'Who Is Lying?';

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
