import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  // 自動適配 GitHub Pages 倉庫路徑：
  // 在 GitHub Actions 執行時，會自動帶入 GITHUB_REPOSITORY (例如 "tida760523/repo-name")
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const isUserPage = repoName && repoName.toLowerCase().endsWith('.github.io');
  const base = repoName ? (isUserPage ? '/' : `/${repoName}/`) : './';

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
