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

  const merged = {
    ...defaults.frontend_dev_server,
    ...custom.frontend_dev_server,
  };

  const env: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(merged)) {
    env[`RR_FRONTEND_DEV_${key.toUpperCase()}`] = value;
  }

  env['RR_OAUTH_CLIENT_ID'] =
    custom?.oauth?.client_id || defaults?.oauth.client_id;
  env['RR_OAUTH_BASE_URL'] =
    custom?.oauth?.base_url || defaults?.oauth.base_url;
  env['RR_OAUTH_TENANT_ID'] =
    custom?.oauth?.tenant_id || defaults?.oauth.tenant_id;
  env['RR_OAUTH_ISSUER_PATH'] =
    custom?.oauth?.issuer_path || defaults?.oauth.issuer_path;

  for (const [key, _] of Object.entries(env)) {
    const envVal = process.env[`${key}`];
    if (envVal != undefined && envVal != '') {
      env[key] = envVal;
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
      __CLIENT_ID__: JSON.stringify(env.RR_OAUTH_CLIENT_ID),
      __AUTHORITY__: JSON.stringify(
        `${env.RR_OAUTH_BASE_URL}/${env.RR_OAUTH_TENANT_ID}${env.RR_OAUTH_ISSUER_PATH}`
      ),
    },
    server: {
      port: Number(env.FRONTEND_DEV_SERVER_PORT),
      host: env.FRONTEND_DEV_SERVER_HOST as string,
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
