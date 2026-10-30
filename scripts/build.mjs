import { copyFile, mkdir, access, readdir } from 'node:fs/promises';
await mkdir('dist/web', { recursive: true });
const assets = ['index.html', 'styles.css', 'sw.js', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'landing.html', 'landing.css', 'safety.html'];
await Promise.all(assets.map(async file => { try { await access(`src/web/${file}`); await copyFile(`src/web/${file}`, `dist/web/${file}`); } catch { /* optional asset not generated yet */ } }));
// Landing page screenshots.
await mkdir('dist/web/img', { recursive: true });
for (const file of await readdir('src/web/img').catch(() => [])) await copyFile(`src/web/img/${file}`, `dist/web/img/${file}`);
// The one-page pilot proposal, offered as a download on the page for teams.
await copyFile('docs/Sukoon - Pilot Proposal.pdf', 'dist/web/lull-pilot-proposal.pdf').catch(() => {});
console.log('Built local server and browser assets.');
