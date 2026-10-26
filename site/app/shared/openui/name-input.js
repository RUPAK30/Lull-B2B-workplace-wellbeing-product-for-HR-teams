const NAME = /^\p{L}[\p{L}\p{M}'’-]*(?: \p{L}[\p{L}\p{M}'’-]*)?$/u;
export function validateName(raw) {
    const name = raw.trim().replace(/\s+/g, ' ');
    if (!name)
        return { ok: false, message: 'Type a name, or choose “Skip the name”.' };
    if (name.length > 24)
        return { ok: false, message: 'Keep it to 24 characters or fewer.' };
    if (!NAME.test(name))
        return { ok: false, message: 'Just a first name in letters. Hyphens and apostrophes are fine.' };
    return { ok: true, name };
}
/** The message the field sends: explicit, so any valid name is read as a name. */
export const nameMessage = (name) => `My name is ${name}`;
