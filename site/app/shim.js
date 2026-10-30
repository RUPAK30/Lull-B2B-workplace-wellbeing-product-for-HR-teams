// Stands in for the local server's API in the hosted demo. Mock mode only: no network calls.
import { mockTurn } from './server/mock.js?v=mvvbagjl';
import { isTurn, APP_VERSION, SCHEMA_VERSION } from './shared/contracts.js?v=mvvbagjl';
import { redactValue } from './shared/redact.js?v=mvvbagjl';

const wiring = fetch(new URL('./examples/wiring.openui', import.meta.url)).then(r => r.text());
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const config = { defaultProvider: 'mock', token: 'hosted', appVersion: APP_VERSION,
  providers: [{ id: 'mock', label: 'Offline (no AI)', enabled: true, model: 'wiring-fixture-v1', message: 'Runs entirely in this browser on Lull\u2019s fixed rules. Nothing is sent anywhere.' }] };
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
