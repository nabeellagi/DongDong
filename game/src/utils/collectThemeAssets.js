import { THEMED_ASSETS } from "../core/data/themed_assets"
import { k } from "../core/kaplay";

/**
 * Filter assets based on the determined theme
 * @param {Object} theme - The selected theme
 * @returns 
 */

export function collectThemeAssets(theme) {
    const keys = [
        theme.paddleSprite,
        theme.background
    ];

    const results = {};

    for(const key of keys){
        if(!key) continue;

        if(THEMED_ASSETS[key]){
            results[key] = THEMED_ASSETS[key];
        }else{
            k.debug.error(`[ASSETS MISSING] "${key} on ${theme.name}"`)
        }
    };

    return results;
}