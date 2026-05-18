#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const src = path.join(root, 'frontend', 'dist');
const dest = path.join(__dirname, '..', 'client');

function rmrf(target) {
  if (!fs.existsSync(target)) return;
  fs.rmSync(target, { recursive: true, force: true });
}

function copyRecursive(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, entry.name);
    const d = path.join(to, entry.name);
    if (entry.isDirectory()) copyRecursive(s, d);
    else fs.copyFileSync(s, d);
  }
}

if (!fs.existsSync(src)) {
  console.error(`[build-client] frontend build not found at ${src}`);
  console.error('[build-client] run `npm --prefix frontend run build` first');
  process.exit(1);
}

console.log(`[build-client] cleaning ${dest}`);
rmrf(dest);
console.log(`[build-client] copying ${src} -> ${dest}`);
copyRecursive(src, dest);
console.log('[build-client] done');
