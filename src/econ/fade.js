import fadeData from "../data/fade.json";

const FADE_KINDS = ['amber fade', 'acid fade', 'fade'];

/**
 * Looks up the fade percentage of an item by its title ("M4A1-S Fade", "★ Karambit | Fade (Factory New)")
 * and paint seed. Returns undefined when the skin has no fade table (marble fade, gloves, other skins).
 */
export function findFade(title, seed) {
    if (typeof title !== 'string' || !Number.isInteger(seed)) return;

    const name = title
        .replace(/^★\s*/, '')
        .replace(/^(StatTrak™|Souvenir)\s+/i, '')
        .replace(/\(.*?\)/g, '')
        .replace('|', ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

    for (const kind of FADE_KINDS) {
        if (!name.endsWith(` ${kind}`)) continue;

        const weapon = name.slice(0, -(kind.length + 1)).trim();
        const entry = fadeData[kind]?.[weapon]?.[seed];
        if (!entry) return;

        const [percentage, ranking] = entry;
        return { mode: kind, percentage, ranking };
    }
}
