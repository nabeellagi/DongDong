import { k } from "../core/kaplay";

/**
 * @function ball
 * @description Sets up ball for the game
 * @param {number} x - x coordinate
 * @param {number} y - y coordinate
 * @returns 
 */

export function ball(x, y) {
    return k.add([k.circle(15),
    k.pos(x, y),
    k.color("#410a00"),
    k.area(),
    k.anchor("center"),
    {
        vel: k.vec2(500, 200)
    }
    ])
}
