export class TimerLedger {
    clock;
    entries = new Map();
    offset = 0;
    constructor(clock = () => Date.now()) {
        this.clock = clock;
    }
    now() { return this.clock() + this.offset; }
    remainingOf(e) { return e.status !== 'running' || e.startedAt === null ? e.startRemaining : Math.max(0, e.startRemaining - (this.now() - e.startedAt) / 1000); }
    ensure(id, fields) {
        const entry = this.entries.get(id);
        if (!entry || entry.seconds !== fields.seconds)
            this.entries.set(id, { ...fields, startedAt: null, startRemaining: fields.seconds, status: 'stopped' });
        else
            entry.label = fields.label;
    }
    start(id) {
        const e = this.entries.get(id);
        if (!e)
            return;
        this.entries.set(id, { ...e, startedAt: this.now(), startRemaining: e.status === 'done' ? e.seconds : this.remainingOf(e), status: 'running' });
    }
    pause(id) {
        const e = this.entries.get(id);
        if (!e || e.status === 'done')
            return;
        const resuming = e.status !== 'running';
        this.entries.set(id, { ...e, startedAt: resuming ? this.now() : null, startRemaining: this.remainingOf(e), status: resuming ? 'running' : 'paused' });
    }
    reset(id) { const e = this.entries.get(id); if (e)
        this.entries.set(id, { ...e, startedAt: null, startRemaining: e.seconds, status: 'stopped' }); }
    list() {
        return [...this.entries].map(([id, e]) => {
            const remaining = this.remainingOf(e);
            if (e.status === 'running' && remaining <= 0) {
                e = { ...e, startedAt: null, startRemaining: 0, status: 'done' };
                this.entries.set(id, e);
            }
            return { id, label: e.label, seconds: e.seconds, remaining, status: e.status };
        });
    }
    finish(id) { const e = this.entries.get(id); if (e)
        this.entries.set(id, { ...e, startedAt: null, startRemaining: 0, status: 'done' }); }
    advance(seconds) { this.offset += seconds * 1000; }
    forget(id) { if (id)
        this.entries.delete(id);
    else {
        this.entries.clear();
        this.offset = 0;
    } }
}
