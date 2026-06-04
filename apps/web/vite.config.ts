import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'node:child_process';

function getGitShortHash(): string {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return 'local';
  }
}

const appVersion = process.env['npm_package_version'] ?? '0.0.0';
const buildVersion = `v${appVersion}-${getGitShortHash()}`;

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_BUILD_VERSION__: JSON.stringify(buildVersion),
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
