import { k } from "../core/kaplay";

/**
 * @function loadAll
 * @description loading sprite assets for a scene at once.
 * @param {Object<string, string>} assets - spriteName : filePath
 * @example
 * loadAll({
 *    player : 'path/to/player.png',
 *    enemy  : 'path/to/enemy.png'
 * }) 
 */

export function loadAll(assets){
    for (const [name, path] of Object.entries(assets)){
        k.loadSprite(name, path)
    }
}