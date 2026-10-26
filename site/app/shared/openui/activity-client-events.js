/**
 * WHAT THE READER DID, in the words the model will read.
 *
 * Plain English on purpose: these lines are model context, not a machine-parsed
 * event object, and they go up on the next turn's `client_events`. Kept in one
 * place because the phrasing is a small client/backend contract — she is asked to
 * reason about "Now on step 3 of 6 — Rest timer", so the sentence has to mean
 * the same thing every time it is written.
 */
/** A duration as it should appear in the event trail. */
export const durationPhrase = (seconds) => {
    const total = Math.max(0, Math.round(seconds));
    const minutes = Math.floor(total / 60);
    const rest = total % 60;
    const plural = (n, unit) => {
        return `${String(n)} ${unit}${n === 1 ? "" : "s"}`;
    };
    if (minutes === 0) {
        return plural(rest, "second");
    }
    if (rest === 0) {
        return plural(minutes, "minute");
    }
    return `${plural(minutes, "minute")} ${plural(rest, "second")}`;
};
export const activityClientEvents = {
    nowOnStep: (step) => {
        return `Now on ${step}.`;
    },
    completedStep: (step) => {
        return `Completed ${step}.`;
    },
    wentBack: (from, to) => {
        return `Went back from ${from} to ${to}.`;
    },
    startedTimer: (label, seconds) => {
        return `Started a timer for ${label} — ${durationPhrase(seconds)}.`;
    },
    pausedTimer: (label, remaining) => {
        return `Paused the timer for ${label} with ${durationPhrase(remaining)} remaining.`;
    },
    resumedTimer: (label, remaining) => {
        return `Resumed the timer for ${label} with ${durationPhrase(remaining)} remaining.`;
    },
    resetTimer: (label, seconds) => {
        return `Reset the timer for ${label} to ${durationPhrase(seconds)}.`;
    },
    restartedTimer: (label, seconds) => {
        return `Restarted the timer for ${label} — ${durationPhrase(seconds)}.`;
    },
    finishedTimer: (label) => {
        return `The timer for ${label} finished.`;
    },
    stoppedTimer: (label) => {
        return `Stopped the timer for ${label} before it finished.`;
    },
};
/** The one event produced by a timer's state transition, if any. */
export const timerTransitionEvent = (previous, current) => {
    if (!previous) {
        return activityClientEvents.startedTimer(current.label, current.seconds);
    }
    if (previous.status === "done" && current.status === "running") {
        return activityClientEvents.restartedTimer(current.label, current.seconds);
    }
    if (previous.status === "running" && current.status === "paused") {
        return activityClientEvents.pausedTimer(current.label, current.remaining);
    }
    if (previous.status === "paused" && current.status === "running") {
        return activityClientEvents.resumedTimer(current.label, current.remaining);
    }
    if (previous.status !== "done" && current.status === "done") {
        return activityClientEvents.finishedTimer(current.label);
    }
    return null;
};
/** Removing a live or paused timer is Stop; removing an acknowledged one is
 *  quiet. */
export const timerRemovedEvent = (previous) => {
    return previous.status === "done"
        ? null
        : activityClientEvents.stoppedTimer(previous.label);
};
