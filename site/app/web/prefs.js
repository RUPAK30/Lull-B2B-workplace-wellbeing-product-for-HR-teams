const PREFS = 'sw.prefs', MEMORY = 'sw.memory';
function read(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
    }
    catch {
        return fallback;
    }
}
function write(key, value) { try {
    localStorage.setItem(key, JSON.stringify(value));
}
catch { /* private mode: keep in memory only */ } }
export const prefs = read(PREFS, { ready: true, chime: false, remember: false, theme: 'light' });
export const savePrefs = () => write(PREFS, prefs);
/** Memory is opt-in: nothing is read or written unless the person turned it on. */
export const loadMemory = () => prefs.remember ? read(MEMORY, {}) : {};
export function saveMemory(update) { if (prefs.remember)
    write(MEMORY, { ...loadMemory(), ...update }); }
export function forgetMemory() { try {
    localStorage.removeItem(MEMORY);
}
catch { /* nothing stored */ } }
export function applyTheme() {
    const root = document.documentElement;
    if (prefs.theme === 'auto')
        delete root.dataset.theme;
    else
        root.dataset.theme = prefs.theme;
}
// A soft two-note chime, created only after the person enables it (a user gesture).
let audio;
export function primeChime() { try {
    audio ??= new AudioContext();
}
catch {
    audio = undefined;
} }
export function chime() {
    if (!prefs.chime)
        return;
    try {
        audio ??= new AudioContext();
        const t = audio.currentTime;
        for (const [freq, delay] of [[660, 0], [880, 0.18]]) {
            const osc = audio.createOscillator(), gain = audio.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, t + delay);
            gain.gain.linearRampToValueAtTime(0.08, t + delay + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.9);
            osc.connect(gain).connect(audio.destination);
            osc.start(t + delay);
            osc.stop(t + delay + 1);
        }
    }
    catch { /* audio unavailable: silently skip */ }
}
/** Polite screen-reader announcements for timer and session changes. */
let lastSaid = '';
export function announce(text) {
    const node = document.getElementById('announcer');
    if (!node || !text || text === lastSaid)
        return;
    lastSaid = text;
    node.textContent = text;
}
