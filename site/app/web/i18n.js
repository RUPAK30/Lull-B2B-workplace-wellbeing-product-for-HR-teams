// Shows the app in English, Hindi or Marathi. The engine keeps speaking English internally (buttons still
// send their English labels), and this layer translates every line on screen as it is drawn.
// The language follows the person: typing in Devanagari switches it; Roman Hinglish/Marathi gets a one-tap offer.
import { STRINGS } from './i18n-strings.js?v=mvwgfwjp';
const table = new Map();
for (const line of STRINGS.split('\n')) {
    const [en, hi, mr] = line.split(' || ').map(s => s?.trim());
    if (en && hi && mr) {
        table.set(en, { hi, mr });
        table.set(en.toLowerCase(), { hi, mr });
    }
}
const KEY = 'sukoon.lang';
let lang = (() => { try {
    const v = localStorage.getItem(KEY);
    return v === 'hi' || v === 'mr' ? v : 'en';
}
catch {
    return 'en';
} })();
export const currentLang = () => lang;
const word = (en) => table.get(en)?.[lang] ?? table.get(en.toLowerCase())?.[lang] ?? null;
const W = { hi: { suggested: 'सुझाव', for: 'आपके लिए', seated: 'बैठकर शुरू करें', standing: 'खड़े होकर शुरू करें', suggest: 'मेरा सुझाव', another: 'अगली बार आज़माएँ', switchTo: 'इस पर जाएँ', steps: 'छोटे स्टेप', moved: (m) => `आपने ${m} हरकत की — व्यस्त दिन में भी यह मायने रखता है।`, min: 'मिनट', sec: 'सेकंड', planned: 'तय', recorded: 'टाइमर ने क्या दर्ज किया', of: 'में से', switching: 'इस पर बदल रहे हैं' },
    mr: { suggested: 'सुचवलेले', for: 'तुमच्यासाठी', seated: 'बसून सुरू करा', standing: 'उभे राहून सुरू करा', suggest: 'माझा सुझाव', another: 'पुढच्या वेळी करून पाहा', switchTo: 'यावर जा', steps: 'छोट्या स्टेप', moved: (m) => `तुम्ही ${m} हालचाल केली — धावपळीच्या दिवशीही हे महत्त्वाचं आहे.`, min: 'मिनिटं', sec: 'सेकंद', planned: 'ठरलेलं', recorded: 'टायमरने काय नोंदवलं', of: 'पैकी', switching: 'यावर बदलतोय' } };
// Recap pieces: "0 of 4 timers ran to zero", "4 marked finished early", …
function piece(p) {
    const hi = lang === 'hi';
    let m;
    if ((m = p.match(/^(\d+) of (\d+) timers? ran to zero$/)))
        return hi ? `${m[2]} में से ${m[1]} टाइमर पूरे चले` : `${m[2]} पैकी ${m[1]} टायमर पूर्ण चालले`;
    if ((m = p.match(/^(\d+) marked finished early$/)))
        return hi ? `${m[1]} पहले ही पूरे माने गए` : `${m[1]} आधीच पूर्ण केले`;
    if ((m = p.match(/^(\d+) paused for safety$/)))
        return hi ? `${m[1]} सुरक्षा के लिए रोके गए` : `${m[1]} सुरक्षेसाठी थांबवले`;
    if ((m = p.match(/^(\d+) still open$/)))
        return hi ? `${m[1]} अभी चल रहे` : `${m[1]} अजून चालू`;
    if ((m = p.match(/^(\d+) reset$/)))
        return hi ? `${m[1]} दोबारा शुरू किए` : `${m[1]} पुन्हा सुरू केले`;
    if ((m = p.match(/^(\d+) not started$/)))
        return hi ? `${m[1]} शुरू नहीं हुए` : `${m[1]} सुरू झाले नाहीत`;
    if ((m = p.match(/^([\d:]+) planned$/)))
        return hi ? `${m[1]} तय` : `${m[1]} ठरलेले`;
    return null;
}
function sentence(s) {
    const t = s.trim();
    if (!t)
        return s;
    const direct = word(t);
    if (direct)
        return direct;
    const w = W[lang];
    let m;
    if ((m = t.match(/^Suggested: (.+)$/)))
        return `${w.suggested}: ${word(m[1]) ?? m[1]}`;
    if ((m = t.match(/^For (.+)$/)) && m[1].split(' · ').every(p => word(p)))
        return `${w.for}: ${m[1].split(' · ').map(p => word(p)).join(' · ')}`;
    if ((m = t.match(/^Start (seated|standing) · ([\d:]+)$/)))
        return `${w[m[1]]} · ${m[2]}`;
    if ((m = t.match(/^I’d suggest (.+) \(([\d:]+)\)\.$/)))
        return `${w.suggest}: ${word(m[1]) ?? m[1]} (${m[2]})${lang === 'hi' ? '।' : '.'}`;
    if ((m = t.match(/^Another time, try (.+)\.$/)))
        return `${w.another}: ${word(m[1]) ?? m[1]}${lang === 'hi' ? '।' : '.'}`;
    if ((m = t.match(/^Switch to (.+?)(\?)?$/)) && word(m[1]))
        return `${word(m[1])}${m[2] ? '?' : ''} — ${w.switchTo}`;
    if ((m = t.match(/^Switching to (.+)\.$/)))
        return `${w.switching}: ${word(m[1]) ?? m[1]}`;
    if ((m = t.match(/^(\d+) short steps · ([\d:]+)\.?$/)))
        return `${m[1]} ${w.steps} · ${m[2]}`;
    if ((m = t.match(/^(\d+) of (\d+) · (.+)$/)))
        return `${m[1]}/${m[2]} · ${word(m[3]) ?? m[3]}`;
    if ((m = t.match(/^What the timers recorded · ([\d:]+) planned$/)))
        return `${w.recorded} · ${m[1]} ${w.planned}`;
    if ((m = t.match(/^You moved for (.+?) — that counts, even on a busy day\.$/)))
        return w.moved(m[1].replace('min', w.min).replace('sec', w.sec));
    if ((m = t.match(/^At (\d\d:\d\d)$/)))
        return lang === 'hi' ? `${m[1]} बजे` : `${m[1]} वाजता`;
    if ((m = t.match(/^Step (\d+) of (\d+)$/)))
        return lang === 'hi' ? `स्टेप ${m[1]} / ${m[2]}` : `स्टेप ${m[1]} / ${m[2]}`;
    if ((m = t.match(/^([\d:]+) on the timer$/)))
        return lang === 'hi' ? `टाइमर पर ${m[1]}` : `टायमरवर ${m[1]}`;
    if ((m = t.match(/^Last step\. (.+)$/))) {
        const rest = sentence(m[1]) ?? m[1];
        return (lang === 'hi' ? 'आख़िरी स्टेप। ' : 'शेवटची स्टेप. ') + rest;
    }
    if ((m = t.match(/^(\d+) of (\d+) timers? ran to zero(?: · (\d+) not started)?\.?$/)))
        return lang === 'hi' ? `${m[2]} में से ${m[1]} टाइमर पूरे चले${m[3] ? ` · ${m[3]} शुरू नहीं हुए` : ''}।` : `${m[2]} पैकी ${m[1]} टायमर पूर्ण चालले${m[3] ? ` · ${m[3]} सुरू झाले नाहीत` : ''}.`;
    if (t.includes(' · ')) {
        const parts = t.split(' · ').map(p => word(p) ?? piece(p.replace(/\.$/, '')) ?? (/^[\d:/½ ]+$/.test(p) ? p : null));
        if (parts.every(Boolean))
            return parts.join(' · ');
    }
    return null;
}
/** Translates one line; unknown pieces stay as they are rather than breaking the line. */
export function tr(text) {
    if (lang === 'en' || !/[A-Za-z]/.test(text))
        return text;
    const lead = text.match(/^\s*/)[0], tail = text.match(/\s*$/)[0], core = text.trim();
    const whole = sentence(core);
    if (whole)
        return lead + whole + tail;
    const parts = core.split(/(?<=[.?!])\s+/);
    if (parts.length > 1) {
        let any = false;
        const out = parts.map(p => { const x = sentence(p); if (x)
            any = true; return x ?? p; });
        if (any)
            return lead + out.join(' ') + tail;
    }
    return text;
}
// Translate what is on screen, and keep the English so switching back is exact.
const original = new WeakMap(), originalAttr = new WeakMap();
const SKIP = 'textarea, input, script, style, #transcript, #state-json, .lang-switch, [data-no-tr]';
let busy = false;
// Remember both the English and what we last showed, so switching Hindi ↔ Marathi always starts from English.
function translateNode(node) {
    if (node.nodeType === 3) {
        const parent = node.parentElement;
        if (!parent || parent.closest(SKIP))
            return;
        const now = node.nodeValue ?? '', known = original.get(node);
        const en = known && (now === known.shown || now === known.en) ? known.en : now;
        const next = tr(en);
        original.set(node, { en, shown: next });
        if (next !== now)
            node.nodeValue = next;
    }
    else if (node.nodeType === 1) {
        const e = node;
        if (e.matches?.(SKIP) && !e.matches('textarea, input'))
            return;
        for (const attr of ['placeholder', 'aria-label', 'title']) {
            if (!e.hasAttribute?.(attr))
                continue;
            const store = originalAttr.get(e) ?? {}, now = e.getAttribute(attr), k = store[attr];
            const en = k && (now === k.shown || now === k.en) ? k.en : now, next = tr(en);
            store[attr] = { en, shown: next };
            originalAttr.set(e, store);
            if (next !== now)
                e.setAttribute(attr, next);
        }
        if (!e.matches?.('textarea, input'))
            e.childNodes.forEach(translateNode);
    }
}
function sweep() { if (busy)
    return; busy = true; try {
    translateNode(document.body);
}
finally {
    busy = false;
} }
function markSwitch() { document.documentElement.lang = lang === 'en' ? 'en' : lang; document.querySelectorAll('.lang-switch button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang))); }
export function setLang(next) { lang = next; try {
    localStorage.setItem(KEY, next);
}
catch { } markSwitch(); sweep(); document.querySelector('.lang-offer')?.remove(); }
// What they typed decides: Devanagari switches straight away; Roman Hinglish/Marathi gets an offer.
const MR_DEV = /ळ|आहे|नाही|वाटत|झाल|खूप|मला|दुखत|थांब|नको|किती|आखड|पाठ|कंबर|डोळे|तुम्ही|करा/;
const MR_ROMAN = /\b(aahe|ahe|khup|mala|vatat|vatla|vatatay|dukhtay|dukhat|dukhte|zala|zhala|jhala|thamba|nako|kiti|aakhad\w*|kambar|basun|ubhe|halu|sopa|kantala|zop)\b/i;
const HI_ROMAN = /\b(hai|hoon|hu|nahi|nhi|mujhe|bahut|thoda|dard|gardan|kamar|thak\w*|neend|kaise|kya|kitna|aaram|dheere|ruko|karo|raha|rahi|tabiyat|akad\w*|sar|peeth)\b/i;
let offered = false;
export function noticeTyped(text) {
    if (/[\u0900-\u097F]/.test(text)) {
        const next = MR_DEV.test(text) ? 'mr' : 'hi';
        if (next !== lang)
            setLang(next);
        return;
    }
    if (lang !== 'en' || offered)
        return;
    const want = MR_ROMAN.test(text) ? 'mr' : HI_ROMAN.test(text) ? 'hi' : null;
    if (!want)
        return;
    offered = true;
    const bar = document.createElement('div');
    bar.className = 'lang-offer';
    bar.setAttribute('role', 'status');
    const yes = document.createElement('button');
    yes.type = 'button';
    yes.className = 'primary';
    yes.textContent = want === 'hi' ? 'हिंदी में देखें' : 'मराठीत पाहा';
    const no = document.createElement('button');
    no.type = 'button';
    no.className = 'quiet';
    no.textContent = 'Keep English';
    yes.onclick = () => setLang(want);
    no.onclick = () => bar.remove();
    bar.append(yes, no);
    bar.setAttribute('data-no-tr', '');
    document.querySelector('.preview')?.prepend(bar);
}
export function initI18n() {
    // The switch lives in the header: EN · हिं · मरा.
    const actions = document.querySelector('.topbar-actions');
    if (actions && !actions.querySelector('.lang-switch')) {
        const box = document.createElement('div');
        box.className = 'lang-switch';
        box.setAttribute('role', 'group');
        box.setAttribute('aria-label', 'Language');
        for (const [code, label] of [['en', 'EN'], ['hi', 'हिं'], ['mr', 'मरा']]) {
            const b = document.createElement('button');
            b.type = 'button';
            b.dataset.lang = code;
            b.textContent = label;
            b.onclick = () => setLang(code);
            box.append(b);
        }
        actions.prepend(box);
    }
    markSwitch();
    new MutationObserver(() => { if (!busy)
        queueMicrotask(sweep); }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'aria-label', 'title'] });
    sweep();
    // Every message passes through /api/turn; read it on the way out.
    const native = window.fetch.bind(window);
    window.fetch = (input, init) => {
        try {
            const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
            if (url.includes('/api/turn') && typeof init?.body === 'string') {
                const last = JSON.parse(init.body).messages?.at(-1)?.content;
                if (typeof last === 'string')
                    noticeTyped(last);
            }
        }
        catch { }
        return native(input, init);
    };
}
