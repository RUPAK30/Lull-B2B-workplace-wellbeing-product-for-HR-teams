// Adapted from a starter harness provided for a take-home exercise; see docs/HARNESS.md.
/**
 * ── WHERE THE READER IS GOING, OWNED OUTSIDE REACT ──────────────────────────
 *
 * A tap is an intent, dispatched straight in: no render closure sits between the
 * finger and the decision, so a late tap never acts on a stale step. Taps
 * ACCUMULATE (owner, 2026-09-24) — three quick Nexts move three steps, animating
 * once to the last — and a Next past the last DELIVERED step is held, not
 * dropped, and spent when the step lands.
 *
 * ⚠️ THE PHASE RUNS ON ITS OWN TIMERS, NEVER ON AN ANIMATION'S CALLBACK. The
 * dissolve used to clear its lock from a `withTiming` completion routed through
 * the JS queue; a busy thread (or a cut animation) left the lock on and every
 * Next was refused. Here the worst a starved thread can do is show the trough a
 * little longer.
 */
export function createRunNav(ports, timing) {
    let phase = "idle";
    /** Where the taps so far point, inside the delivered steps. */
    let target = null;
    /** Nexts past the last delivered step, waiting for it to land. */
    let held = 0;
    let timer = null;
    const aim = () => {
        return target ?? ports.index();
    };
    const liveAfter = (from) => {
        for (let i = from + 1; i < ports.stepCount(); i += 1) {
            if (!ports.isConsumed(i)) {
                return i;
            }
        }
        return -1;
    };
    const liveBefore = (from) => {
        for (let i = from - 1; i >= 0; i -= 1) {
            if (!ports.isConsumed(i)) {
                return i;
            }
        }
        return -1;
    };
    const setPhase = (next) => {
        phase = next;
        ports.phase(next);
    };
    const pump = () => {
        if (phase !== "idle") {
            return;
        }
        while (held > 0) {
            const ahead = liveAfter(aim());
            if (ahead === -1) {
                break;
            }
            target = ahead;
            held -= 1;
        }
        if (held > 0 && !ports.awaiting()) {
            held = 0;
        }
        const from = ports.index();
        const to = aim();
        if (to === from) {
            target = null;
            return;
        }
        setPhase("leaving");
        ports.leave(from, to);
        timer = setTimeout(() => {
            const dest = aim();
            ports.land(from, dest);
            setPhase("entering");
            timer = setTimeout(() => {
                timer = null;
                if (target === dest) {
                    target = null;
                }
                setPhase("idle");
                pump();
            }, timing.inMs);
        }, timing.outMs);
    };
    return {
        next: () => {
            const ahead = liveAfter(aim());
            if (ahead !== -1) {
                target = ahead;
                pump();
                return;
            }
            if (ports.awaiting()) {
                held += 1;
                return;
            }
            // Nothing ahead and nothing coming: only a reader standing still on the
            // last step finishes it — a Next queued behind a move just lands there.
            if (phase === "idle" && aim() === ports.index()) {
                ports.finish();
            }
        },
        back: () => {
            if (held > 0) {
                held -= 1;
                return;
            }
            const behind = liveBefore(aim());
            if (behind === -1) {
                return;
            }
            target = behind;
            pump();
        },
        delivered: pump,
        phase: () => {
            return phase;
        },
        dispose: () => {
            if (timer) {
                clearTimeout(timer);
            }
            timer = null;
        },
    };
}
