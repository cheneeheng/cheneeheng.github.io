import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://cheneeheng.github.io',
  integrations: [sitemap()],
  // Posts that were published under an older slug. GitHub Pages has no server
  // redirects, so Astro emits a meta-refresh page with a canonical link instead.
  redirects: {
    '/blog/plugin-toggler-lessons': '/blog/claude-code-plugin-toggler--lessons',
    '/blog/claude-code-plugin-manager': '/blog/claude-code-plugin-toggler--plugin-manager',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
