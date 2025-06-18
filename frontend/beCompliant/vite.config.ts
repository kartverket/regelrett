import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { parse } from 'yaml';

export default ({ mode }: { mode: string }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const regelrettRoot = path.join(__dirname, '../..');
  const defaultSettings = readFileSync(`${regelrettRoot}/conf/defaults.yaml`, {
    encoding: 'utf-8',
  });

  const customSettings = existsSync(`${regelrettRoot}/conf/custom.yaml`)
    ? readFileSync(`${regelrettRoot}/conf/custom.yaml`, {
        encoding: 'utf-8',
      })
    : '';

  const defaults = parse(defaultSettings);
  const custom = parse(customSettings);

  for (const [key, value] of Object.entries(defaults)) {
    if (value instanceof Object) {
      defaults[key] = { ...value, ...custom[key] };
    }
  }

  return defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      __CLIENT_ID__: JSON.stringify(defaults.oauth.client_id),
      __AUTHORITY__: JSON.stringify(
        `${defaults.oauth.base_url}/${defaults.oauth.tenant_id}${defaults.oauth.issuer_path}`
      ),
    },
    server: {
      port: defaults.frontend_dev_server.port,
      host: defaults.frontend_dev_server.host,
      strictPort: true,
    },
    build: {
      manifest: true,
      rollupOptions: {
        input: './src/main.tsx',
      },
    },
  });
};
