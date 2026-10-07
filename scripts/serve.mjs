import http from 'node:http';
import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const project = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
function option(name, fallback) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
}
const directory = option('--dir', '.');
if (!['.', 'dist'].includes(directory)) throw new Error('--dir debe ser . o dist.');
const root = await realpath(path.join(project, directory));
const port = Number(option('--port', '4173'));
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Puerto inválido.');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webm': 'video/webm', '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.mmd': 'text/plain; charset=utf-8' };

const server = http.createServer(async (request, response) => {
  function fail(status, message) {
    response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(message);
  }
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.setHeader('Allow', 'GET, HEAD');
    return fail(405, 'Método no permitido.');
  }
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const resource = pathname === '/' ? 'index.html' : pathname.slice(1);
    // Nunca servir package.json, scripts ni archivos internos del proyecto.
    if (!['index.html', 'viabilidad.html', 'build-manifest.json'].includes(resource) && !resource.startsWith('assets/')) return fail(404, 'Recurso no encontrado.');
    const file = await realpath(path.resolve(root, resource));
    const relative = path.relative(root, file);
    if (relative.startsWith('..') || path.isAbsolute(relative)) return fail(403, 'Ruta no permitida.');
    const publicPath = relative.split(path.sep).join('/');
    if (!['index.html', 'viabilidad.html', 'build-manifest.json'].includes(publicPath) && !publicPath.startsWith('assets/')) return fail(404, 'Recurso no encontrado.');
    const info = await stat(file);
    if (!info.isFile()) return fail(404, 'Recurso no encontrado.');
    let start = 0;
    let end = info.size - 1;
    const range = request.headers.range;
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match || (!match[1] && !match[2])) {
        response.setHeader('Content-Range', `bytes */${info.size}`);
        return fail(416, 'Rango inválido.');
      }
      if (match[1]) {
        start = Number(match[1]);
        if (match[2]) end = Math.min(Number(match[2]), end);
      } else start = Math.max(0, info.size - Number(match[2]));
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= info.size) {
        response.setHeader('Content-Range', `bytes */${info.size}`);
        return fail(416, 'Rango fuera del archivo.');
      }
    }
    response.writeHead(range ? 206 : 200, {
      'Content-Type': mime[path.extname(file)] || 'application/octet-stream',
      'Content-Length': Math.max(0, end - start + 1),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      ...(range ? { 'Content-Range': `bytes ${start}-${end}/${info.size}` } : {})
    });
    if (request.method === 'HEAD' || info.size === 0) return response.end();
    const stream = createReadStream(file, { start, end });
    response.on('close', () => stream.destroy());
    stream.on('error', () => response.destroy());
    stream.pipe(response);
  } catch (error) {
    if (error instanceof URIError) return fail(400, 'Ruta inválida.');
    if (['ENOENT', 'ENOTDIR'].includes(error.code)) return fail(404, 'Recurso no encontrado.');
    console.error(error.message);
    return fail(500, 'No se pudo leer el recurso.');
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Tutorial Restaurante: http://127.0.0.1:${port}/`));
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
