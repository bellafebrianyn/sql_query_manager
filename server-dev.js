import http from 'http';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const PORT = 3001;

// Import API handlers
async function handleRequest(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Route API requests
  if (pathname.startsWith('/api/')) {
    try {
      // Dynamic import API handlers
      if (pathname === '/api/get-file-url') {
        const { getCloudinaryUrl } = await import('./api/db.js');
        const publicId = url.searchParams.get('publicId') || 'project_data_master';
        const result = await getCloudinaryUrl(publicId);
        
        if (result) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'File URL not found' }));
        }
        return;
      }

      if (pathname === '/api/save-file-url') {
        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const { fileUrl, publicId } = JSON.parse(body);
            
            if (!fileUrl) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'fileUrl is required' }));
              return;
            }

            const { saveCloudinaryUrl } = await import('./api/db.js');
            await saveCloudinaryUrl(fileUrl, publicId || 'project_data_master');
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'File URL saved successfully' }));
          } catch (error) {
            console.error('Error saving file URL:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
              error: 'Internal server error',
              message: error.message 
            }));
          }
        });
        return;
      }

      if (pathname === '/api/init-db') {
        const { initDatabase } = await import('./api/db.js');
        await initDatabase();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Database initialized successfully' }));
        return;
      }

      // 404 for unknown API routes
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'API route not found' }));
    } catch (error) {
      console.error('API Error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }));
    }
    return;
  }

  // 404 for non-API routes
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
}

const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`🚀 Dev API Server running on http://localhost:${PORT}`);
  console.log(`📡 API routes available at http://localhost:${PORT}/api/*`);
});

