import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve('dist-pages');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
assert.match(html, /Content-Security-Policy/);
assert.match(html, /connect-src 'none'/);
const assets = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(match => match[1]);
assert.ok(assets.some(asset => asset.endsWith('.js')));
assert.ok(assets.some(asset => asset.endsWith('.css')));
for (const asset of assets) {
  assert.ok(asset.startsWith('./'), `Asset must support repository subpaths: ${asset}`);
  assert.ok(existsSync(resolve(root, asset)), `Missing asset: ${asset}`);
}
function inspect(path) {
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    assert.ok(!/^(\.git|\.openai|\.env.*|node_modules)$/.test(entry.name), `Private or source directory in artifact: ${entry.name}`);
    if (entry.isDirectory()) inspect(resolve(path, entry.name));
    else assert.ok(!/\.(map|pem|key|pfx|p12)$/.test(entry.name), `Unexpected file in artifact: ${entry.name}`);
  }
}
inspect(root);
console.log('Pages artifact verified: relative assets, CSP, and no credentials/source directories.');
