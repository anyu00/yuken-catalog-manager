const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8000;
const PUBLIC_DIR = __dirname;

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;

    // Remove trailing slash
    if (pathname !== '/' && pathname.endsWith('/')) {
        pathname = pathname.slice(0, -1);
    }

    // Try to serve the requested file
    let filePath = path.join(PUBLIC_DIR, pathname);

    // Check if file exists
    fs.stat(filePath, (err, stats) => {
        if (!err && stats.isFile()) {
            // File exists, serve it
            const ext = path.extname(filePath);
            const mimeTypes = {
                '.html': 'text/html',
                '.js': 'text/javascript',
                '.css': 'text/css',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml',
                '.ico': 'image/x-icon'
            };
            const contentType = mimeTypes[ext] || 'application/octet-stream';

            fs.readFile(filePath, (err, content) => {
                if (err) {
                    res.writeHead(500);
                    res.end('Error reading file');
                } else {
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(content);
                }
            });
        } else if (!err && stats.isDirectory()) {
            // Directory, serve index.html
            const indexPath = path.join(filePath, 'index.html');
            fs.readFile(indexPath, (err, content) => {
                if (err) {
                    res.writeHead(500);
                    res.end('Error reading index.html');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(content);
                }
            });
        } else {
            // File/directory doesn't exist, serve index.html for SPA routing
            const indexPath = path.join(PUBLIC_DIR, 'index.html');
            fs.readFile(indexPath, (err, content) => {
                if (err) {
                    res.writeHead(404);
                    res.end('404 - Not Found');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(content);
                }
            });
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n✨ Yuken Catalog Manager - SPA Server\n`);
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Also available at http://127.0.0.1:${PORT}\n`);
    console.log(`Test these URLs:`);
    console.log(`  http://localhost:${PORT}/`);
    console.log(`  http://localhost:${PORT}/catalog`);
    console.log(`  http://localhost:${PORT}/order`);
    console.log(`  http://localhost:${PORT}/reports`);
    console.log(`  http://localhost:${PORT}/analytics\n`);
    console.log(`Press Ctrl+C to stop the server\n`);
});
