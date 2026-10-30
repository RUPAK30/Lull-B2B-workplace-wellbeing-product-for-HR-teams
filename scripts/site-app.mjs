// Copies the built app into site/app so the public site can host the real Sukoon in Mock mode.
// The browser answers the app's two API calls itself (site/app/shim.js) with the same mockTurn
// the local server uses, so no server, account or model is involved. Run `npm run build` first.
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd(), dist = join(root, 'dist'), out = join(root, 'site/app');
await rm(out, { recursive: true, force: true });
await mkdir(join(out, 'web'), { recursive: true });

// Every app script except the old landing page and the local service worker, plus its assets.
const web = (await readdir(join(dist, 'web'))).filter(f => (f.endsWith('.js') && !['landing.js', 'sw.js'].includes(f)) || ['styles.css', 'icon.svg', 'icon-192.png', 'icon-512.png'].includes(f));
for (const f of web) await cp(join(dist, 'web', f), join(out, 'web', f));
await cp(join(dist, 'shared'), join(out, 'shared'), { recursive: true });
await mkdir(join(out, 'server'), { recursive: true });
for (const f of ['mock.js', 'lull.js']) await cp(join(dist, 'server', f), join(out, 'server', f));
await mkdir(join(out, 'examples'), { recursive: true });
await cp(join(root, 'examples/wiring.openui'), join(out, 'examples/wiring.openui'));

const html = (await readFile(join(root, 'src/web/index.html'), 'utf8'))
  .replace(/<link rel="manifest"[^>]*>/, '')
  .replaceAll('"/web/', '"./web/')
  // Developer tools (provider switch, patch builder, run capture) stay in the local app only.
  .replace('</head>', '<style>#tab-dev,#panel-dev{display:none!important}</style></head>')
  .replace('<script type="module" src="./web/app.js"></script>', '<script type="module" src="./shim.js"></script><script type="module" src="./web/app.js"></script>')
  .replaceAll('href="/teams"', 'href="../"').replaceAll('href="/safety"', 'href="../safety.html"').replaceAll('href="/"', 'href="./"').replace('<div id="progress"', '<a id="site-link" class="site-link" href="../"><span class="lg">About Sukoon</span><span class="sm">About</span></a><script>(function(){var from=/[?&]from=hr/.test(location.search);try{if(from)sessionStorage.setItem("fromhr","1");from=from||sessionStorage.getItem("fromhr")==="1";}catch(e){}if(from){var a=document.getElementById("site-link");a.classList.add("back");a.innerHTML=\'<span class="lg">← Back to Sukoon for HR</span><span class="sm">← HR site</span>\';a.href="../";}})();</script><div id="progress"').replace('</head>', '<link rel="stylesheet" href="../fonts.css"></head>');
await writeFile(join(out, 'index.html'), html);

await writeFile(join(out, 'shim.js'), `// Stands in for the local server's API in the hosted demo. Mock mode only: no network calls.
import { mockTurn } from './server/mock.js';
import { isTurn, APP_VERSION, SCHEMA_VERSION } from './shared/contracts.js';
import { redactValue } from './shared/redact.js';

const wiring = fetch(new URL('./examples/wiring.openui', import.meta.url)).then(r => r.text());
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const config = { defaultProvider: 'mock', token: 'hosted', appVersion: APP_VERSION,
  providers: [{ id: 'mock', label: 'Offline (no AI)', enabled: true, model: 'wiring-fixture-v1', message: 'Runs entirely in this browser on Sukoon\\u2019s fixed rules. Nothing is sent anywhere.' }] };
// The local app's service worker isn't part of the hosted demo.
if ('serviceWorker' in navigator) { navigator.serviceWorker.register = () => Promise.resolve(); navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister())).catch(() => {}); }
const native = window.fetch.bind(window);
window.fetch = async (input, init = {}) => {
  const path = new URL(typeof input === 'string' ? input : input.url, location.href).pathname;
  if (path.endsWith('/api/config')) return json(200, config);
  if (path.endsWith('/api/turn')) {
    try {
      const request = JSON.parse(init.body);
      await new Promise((resolve, reject) => { const t = setTimeout(resolve, 350); init.signal?.addEventListener('abort', () => { clearTimeout(t); reject(new DOMException('Aborted', 'AbortError')); }, { once: true }); });
      const turn = mockTurn(request, { wiring: await wiring });
      if (!isTurn(turn)) return json(500, { error: 'The response did not match the component schema. Retry this turn.' });
      const versions = { app: APP_VERSION, schema: SCHEMA_VERSION, skillHash: 'hosted', protocolHash: 'hosted', mode: 'mock', provider: 'mock', model: 'wiring-fixture-v1', returnedModel: null, runtimeVersion: null, restrictionProfile: null };
      return json(200, redactValue({ turn, versions }));
    } catch (error) {
      if (error && error.name === 'AbortError') throw error;
      return json(400, { error: 'The conversation request is invalid. Reset and try again.' });
    }
  }
  return native(input, init);
};
`);
console.log('Copied the app into site/app (Mock mode, no server).');

// Cache-bust every module: a returning visitor can never run a mix of old and new files.
const V = Date.now().toString(36);
async function walk(dir) { for (const e of await readdir(dir, { withFileTypes: true })) { const f = join(dir, e.name); if (e.isDirectory()) await walk(f); else if (f.endsWith('.js')) { const src = await readFile(f, 'utf8'); await writeFile(f, src.replace(/(from\s*|import\s*\(\s*|import\s+)(['"])(\.{1,2}\/[^'"]+?\.js)\2/g, `$1$2$3?v=${V}$2`)); } } }
await walk(out);
const page = join(out, 'index.html');
await writeFile(page, (await readFile(page, 'utf8')).replace(/(src|href)="(\.\/(?:web\/)?[^"]+?\.(?:js|css))"/g, `$1="$2?v=${V}"`));
