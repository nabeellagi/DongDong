import { THEMED_ASSETS } from "../core/data/themed_assets"
import { k } from "../core/kaplay";

/**
 * Filter assets based on the determined theme
 * @param {Object} theme - The selected theme
 * @returns 
 */

export function collectThemeAssets(theme) {
    const spriteKeys = [
        theme.paddleSprite,
        theme.background,
    ];

    const soundKeys = [
        theme.bgm,
        // theme.noise
    ];

    const sprites = {};
    const sounds = {};

    // Collect sprites
    for (const key of spriteKeys) {
        if (!key) continue;

        if (THEMED_ASSETS[key]) {
            sprites[key] = THEMED_ASSETS[key];
        } else {
            k.debug.error(`[ASSETS MISSING] Sprite "${key}" in theme "${theme.name}"`);
        }
    }

    // Collect sounds
    for (const key of soundKeys) {
        if (!key) continue;

        if (THEMED_ASSETS[key]) {
            sounds[key] = THEMED_ASSETS[key];
        } else {
            k.debug.error(`[ASSETS MISSING] Sound "${key}" in theme "${theme.name}"`);
        }
    }

    return { sprites, sounds };
}
