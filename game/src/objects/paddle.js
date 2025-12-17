import { k } from "../core/kaplay";

/**
 * @function paddle
 * @description Sets up paddle for pong game
 * @param {number} x - x coordinate
 * @param {number} y - y coordinate
 * @param {string} tag - tag object
 * @returns 
 */

export function paddle(x, y, tag){
    return k.add([
        k.rect(21, 140), // replace with sprite
        k.color("#880C31"),
        k.pos(x, y),
        k.area(),
        k.anchor("center"),
        k.scale(1),
        tag,
        {
            velY : 0
        }
    ])
}