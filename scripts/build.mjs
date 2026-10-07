import { cp, lstat, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
const publicEntries = ['index.html', 'viabilidad.html', 'assets'];

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`No se permiten enlaces simbólicos: ${target}`);
    if (entry.isDirectory()) files.push(...await filesIn(target));
    else if (entry.isFile()) files.push(target);
  }
  return files.sort();
}

async function checkPage(name) {
  const html = await readFile(path.join(root, name), 'utf8');
  if (/<style\b|<script\b(?![^>]*\bsrc=)|\son\w+\s*=|\sstyle\s*=/i.test(html)) {
    throw new Error(`${name}: se esperaban estilos, scripts y eventos separados del HTML.`);
  }
  for (const [, reference] of html.matchAll(/(?:href|src|poster)="([^"]+)"/g)) {
    if (reference.startsWith('#') || /^https?:\/\//.test(reference)) continue;
    if (!reference.startsWith('./')) throw new Error(`Referencia no portátil: ${reference}`);
    const target = path.resolve(root, reference.split(/[?#]/)[0]);
    const relative = path.relative(root, target);
    if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error(`Ruta fuera del proyecto: ${reference}`);
    if (!(await stat(target)).isFile()) throw new Error(`Recurso ausente: ${reference}`);
  }
}

await checkPage('index.html');
await checkPage('viabilidad.html');
// El destino es fijo y se verifica antes de retirar un build anterior.
if (path.dirname(output) !== path.resolve(root) || path.basename(output) !== 'dist') {
  throw new Error('Destino de build fuera del proyecto.');
}
try {
  if ((await lstat(output)).isSymbolicLink()) throw new Error('dist no puede ser un enlace simbólico.');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
await filesIn(path.join(root, 'assets'));
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const entry of publicEntries) await cp(path.join(root, entry), path.join(output, entry), { recursive: true });

const resources = [];
for (const file of await filesIn(output)) {
  const data = await readFile(file);
  resources.push({ path: path.relative(output, file).split(path.sep).join('/'), bytes: data.length, sha256: createHash('sha256').update(data).digest('hex') });
}
await writeFile(path.join(output, 'build-manifest.json'), JSON.stringify({ name: 'Tutorial Restaurante', version: '1.0.0', resources }, null, 2) + '\n');
console.log(`Tutorial Restaurante: ${resources.length} archivos preparados en dist (${(resources.reduce((sum, resource) => sum + resource.bytes, 0) / 1024 / 1024).toFixed(1)} MiB).`);
