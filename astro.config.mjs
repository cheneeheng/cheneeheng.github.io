import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// If deploying to https://<username>.github.io/personal-github-pages,
// set `site` and `base` below. For a user/org root site
// (https://<username>.github.io), drop `base` and set site to that root.
export default defineConfig({
  site: 'https://username.github.io',
  base: '/personal-github-pages',
  vite: {
    plugins: [tailwindcss()],
  },
});
