import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'catalyst-local-dev-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/server/geminiProxy')) {
            if (req.method === 'OPTIONS') {
              res.statusCode = 200;
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
              return res.end();
            }

            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              // Attempt to forward to local Catalyst serve instance on port 3000 if running
              const backendUrl = process.env.VITE_CATALYST_BACKEND_URL || 'http://localhost:3000/server/geminiProxy';
              try {
                const proxyRes = await fetch(backendUrl, {
                  method: req.method,
                  headers: { 'Content-Type': 'application/json' },
                  body: req.method !== 'GET' ? body : undefined
                });

                if (proxyRes.ok) {
                  const data = await proxyRes.json();
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  return res.end(JSON.stringify(data));
                }
              } catch (e) {
                // Catalyst CLI port 3000 not active — handle local dev fallback
              }

              // Fallback response for plain local `npm run dev` to prevent 404 console errors
              try {
                const jsonBody = JSON.parse(body || '{}');
                const action = jsonBody.action;

                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');

                if (action === 'get_user_role') {
                  return res.end(JSON.stringify({
                    success: true,
                    data: {
                      authenticated: true,
                      user_id: 'OFFICER_771',
                      email_id: 'officer771@ksp.gov.in',
                      first_name: 'Investigating',
                      last_name: 'Officer',
                      role_name: 'Investigating Officer',
                      station: 'Cyber Crime Police Station'
                    }
                  }));
                } else if (action === 'datastore_load') {
                  return res.end(JSON.stringify({ success: true, data: [] }));
                } else if (action === 'datastore_save' || action === 'datastore_update' || action === 'datastore_delete') {
                  return res.end(JSON.stringify({ success: true, message: 'Local dev store updated' }));
                }
              } catch (err) {
                // Ignore parse errors
              }

              next();
            });
            return;
          }
          next();
        });
      }
    }
  ],
  server: {
    proxy: {
      '/server': {
        target: process.env.VITE_CATALYST_BACKEND_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
