import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/server': {
        target: process.env.VITE_CATALYST_BACKEND_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            // Gracefully handle when catalyst serve (port 3000) is not running locally
            if (res.headersSent) return;
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              try {
                const jsonBody = JSON.parse(body || '{}');
                const action = jsonBody.action;

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
                  return res.end(JSON.stringify({ success: true, message: 'Local store updated' }));
                }
              } catch (e) {}

              res.end(JSON.stringify({
                success: false,
                message: 'Local backend server on port 3000 offline — using local fallback'
              }));
            });
          });
        }
      }
    }
  }
});
