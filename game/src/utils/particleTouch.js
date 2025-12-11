import gsap from "gsap";
import { k } from "../core/kaplay";

/**
 * @function particleTouch
 * @param {number} x - x coordinate
 * @param {number} y - y coordinate
 * @description Spawn particles at specified positions through x and y coordinate. Randomized particles with falling effect
 * @example
 * const mousePosition = mousePos();
 * particleTouch(mousePosition.x, mousePosition.y);
 */

export function particleTouch(x, y) {
  const particleCount = 12;

  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 20 + Math.random() * 40; // more variation

    const p = k.add([
      k.pos(x, y),
      k.circle(3),
      k.color("#e36301"),
      k.opacity(1),
      { life: 1 },
    ]);

    // Burst up
    gsap.to(p.pos, {
      x: x + Math.cos(angle) * distance,
      y: y + Math.sin(angle) * distance, // correct scatter
      duration: 0.3,
      ease: "power2.out",
    });

    // Fall
    gsap.to(p.pos, {
      y: "+=" + (40 + Math.random() * 20), // fall downwards
      duration: 0.5,
      delay: 0.2,
      ease: "power1.in",
    });

    // Fade out
    gsap.to(p, {
      opacity: 0,
      duration: 0.4,
      delay: 0.25,
      ease: "power1.out",
      onComplete: () => p.destroy(),
    });
  }
}
