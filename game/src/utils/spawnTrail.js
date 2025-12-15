import gsap from "gsap";
import { k } from "../core/kaplay";

export function spawnTrail(
    pos,
    color = k.rgb(45, 187, 226),
    life = 5,
    vel = k.vec2(1, 0)
) {
    const angle = Math.atan2(vel.y, vel.x);

    const trail = k.add([
        k.rect(22, 4),
        k.pos(pos.x, pos.y),
        k.anchor("center"),
        k.rotate(angle),
        k.color(color),
        k.opacity(0.9),
        k.z(20)
    ]);

    gsap.to(trail, {
        opacity: 0,
        duration: life,
        ease: "power2.out",
        onComplete: () => trail.destroy()
    });

    gsap.fromTo(
        trail.scale,
        { x: 1.4, y: 1 },
        {
            x: 0.1,
            y: 0.4,
            duration: life,
            ease: "power2.out",
        }
    );
}
