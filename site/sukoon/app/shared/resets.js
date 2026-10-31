export const RESETS = ['unknot', 'unsit', 'energy', 'calm', 'screen'];
export const RESET_NAMES = { unknot: 'Unknot neck & shoulders', unsit: 'Undo the sitting', energy: 'Energy lift', calm: 'Calm down', screen: 'Screen break' };
/** The work moments people pick from: how the day feels, not a type of exercise. */
export const RESET_MOMENTS = { unknot: 'After back-to-back calls', unsit: 'Stiff from sitting', energy: 'Post-lunch slump', calm: 'Stressed, can’t switch off', screen: 'Tired eyes and wrists' };
export const POSTURES = ['seated', 'standing'];
export const POSTURE_LABELS = { seated: 'Seated', standing: 'Standing' };
/** Where each reset starts if the person didn't say: calm and screen work best seated, the rest standing beside the desk. */
export const DEFAULT_POSTURE = { unknot: 'seated', unsit: 'standing', energy: 'standing', calm: 'seated', screen: 'seated' };
/** Reads a session title such as "Calm down · Seated" back into its reset and posture. */
export function fromTitle(title) {
    const [name, label] = title.split(' · '), reset = RESETS.find(r => RESET_NAMES[r] === name), posture = POSTURES.find(p => POSTURE_LABELS[p] === label);
    return reset && posture ? { reset, posture } : null;
}
