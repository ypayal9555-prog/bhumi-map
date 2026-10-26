import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// Split the big third-party libraries out of the app chunk so a code change does
// not force browsers to re-download React/motion/icons.
const vendorChunks = (id: string): string | undefined => {
  const normalised = id.replace(/\\/g, '/');
  if (!normalised.includes('node_modules')) return undefined;
  if (normalised.includes('/react-dom/') || normalised.includes('/react/')) return 'react-vendor';
  if (normalised.includes('/motion/') || normalised.includes('/framer-motion/')) return 'motion';
  if (normalised.includes('/lucide-react/')) return 'icons';
  return 'vendor';
};

export default defineConfig(() => {
  // GitHub Pages serves a project site from /<repo>/, so the production build
  // needs that prefix. Deriving it from GITHUB_REPOSITORY keeps the workflow
  // honest if the repo is ever renamed or forked. A user/organisation site
  // (<owner>.github.io) is served from the root and needs no prefix.
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const pagesBase = repo && !repo.endsWith('.github.io') ? `/${repo}/` : '/';
  const base = process.env.BASE_PATH ?? pagesBase;

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: vendorChunks,
        },
      },
    },
    server: {
      port: 3000,
    },
  };
});
