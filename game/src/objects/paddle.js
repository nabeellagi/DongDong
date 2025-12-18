import { k } from "../core/kaplay";

/**
 * @function paddle
 * @description Sets up paddle for pong game
 * @param {number} x - x coordinate
 * @param {number} y - y coordinate
 * @param {string} tag - tag object
 * @returns 
 */

export function paddle(x, y, img, scale=1, tag){
    return k.add([
        // k.rect(25, 150), // replace with sprite
        // k.color("#880C31"),
        k.sprite(img),
        k.pos(x, y),
        k.area(),
        k.anchor("center"),
        k.scale(scale),
        tag,
        {
            velY : 0
        }
    ])
}