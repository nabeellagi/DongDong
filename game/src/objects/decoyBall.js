import { k } from "../core/kaplay";

export function decoyBall(x, y, color) {
    const b = k.add([
        k.circle(15),
        k.color(color),
        k.pos(x, y),
        k.area(),
        k.z(10),
        {
            vel: k.vec2(
                k.rand(-600, 600),
                k.rand(-400, 400)
            ),
            isDecoy: true,
        },
        k.opacity(0.7)
    ]);

    return b;
};
