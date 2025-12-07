import { k } from "../core/kaplay";
import { gsap } from "gsap";
import { loadAll } from "../utils/loadAll";

/**
 * Register menu scene
 *
 * @function registerMenu
 * @description sets up the menu for the game.
 * @example
 * import { registerGame } from "./scenes/game";
 * registerMenu();
 */

export function registerMenu() {
  k.scene("menu", () => {
    // Load assets
    const assets = {
      arcadeframe: "/menu/arcadeframe.png",
      d: "/menu/logo/d.png",
      o: "/menu/logo/o.png",
      n: "/menu/logo/n.png",
      g: "/menu/logo/g.png",
      glasspattern: "/menu/glasspattern.png",
    };
    loadAll(assets);

    // Set background
    k.setBackground(246, 234, 193);

    // Frame
    const arcadeframe = k.add([
      k.sprite("arcadeframe"),
      k.scale(0.8),
      // k.pos(1366/2, 768/2)
    ]);
    const arcadeglass = k.add([
      k.sprite("glasspattern"),
      k.scale(0.9),
      k.pos(62, 75),
    ]);

    // Logo 1
    const d1 = k.add([k.sprite("d"), k.scale(0.5), k.pos(190, 190)]);
    const o1 = k.add([k.sprite("o"), k.scale(0.5), k.pos(250, 185)]);
    const n1 = k.add([k.sprite("n"), k.scale(0.5), k.pos(300, 190)]);
    const g1 = k.add([k.sprite("g"), k.scale(0.5), k.pos(360, 190)]);
    // Logo 2
    const d2 = k.add([k.sprite("d"), k.scale(0.5), k.pos(310, 290)]);
    const o2 = k.add([k.sprite("o"), k.scale(0.5), k.pos(370, 285)]);
    const n2 = k.add([k.sprite("n"), k.scale(0.5), k.pos(420, 290)]);
    const g2 = k.add([k.sprite("g"), k.scale(0.5), k.pos(480, 290)]);
    const letters = [d1, o1, n1, g1, d2, o2, n2, g2];
    letters.forEach((letter, i) => {
      gsap.delayedCall(i * 0.1, () => bounce(letter));
    });
  });
}

/**
 * @function bounce
 * @description adding GSAP bounce effect
 */
function bounce(obj) {
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.2 });

  // Step 1, Jump up slightly
  tl.to(obj.pos, {
    y: obj.pos.y - 12,
    duration: 0.6,
    ease: "circ.out",
  });

  // Step 2, Fall down
  tl.to(obj.pos, {
    y: obj.pos.y,
    duration: 0.6,
    ease: "elastic.out",
  });

  // Step 3, Squash on landing (jiggle)
  tl.to(
    obj.scale,
    {
      x: obj.scale.x * 1.05,
      y: obj.scale.y * 0.95,
      duration: 0.23,
      ease: "power1.out",
    },
    "-=0.15" // overlaps Step 2 for nicer impact
  );

  // Step 4, Return to normal shape
  tl.to(obj.scale, {
    x: obj.scale.x,
    y: obj.scale.y,
    duration: 0.2,
    ease: "power1.inOut",
  });

  return tl;
}
