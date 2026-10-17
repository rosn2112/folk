import assert from 'node:assert/strict';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'dist');
const files = ['index.html', 'style.css', 'main.js', 'site-logic.mjs', 'assets', 'tour'];
for (const file of files) assert(existsSync(join(root, file)), `Missing site file: ${file}`);
rmSync(output, { recursive: true, force: true });
mkdirSync(output);
for (const file of files) cpSync(join(root, file), join(output, file), { recursive: true });
assert.equal(readFileSync(join(output, 'index.html'), 'utf8'), readFileSync(join(root, 'index.html'), 'utf8'));
assert(existsSync(join(output, 'tour/copy.js')));
assert(existsSync(join(output, 'tour/assets/home.glb')));
assert(!existsSync(join(output, 'Main.light-backup.dc.html')));
assert(!existsSync(join(output, 'tests')));
console.log('Built dist/ with the current page, assets and guided tour.');
