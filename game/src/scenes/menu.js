import { k } from "../core/kaplay";
import { gsap } from "gsap";
import { loadAll } from "../utils/loadAll";
import { makeButton } from "../utils/makeButton";
import { particleTouch } from "../utils/particleTouch";

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
      start: "/menu/Start.png",
      tutorial: "/menu/Tutorial.png",
      credits: "/menu/Credits.png",
      checker: "/menu/checker1.png",
    };
    loadAll(assets);

    // Load sound
    k.loadSound("click1", "/sfx/click1.ogg");

    // Particle Touch Effect
    k.onMousePress((pos) => {
      const mousePosition = k.mousePos();
      particleTouch(mousePosition.x, mousePosition.y);
      // Audio
      const clickSnd = k.play("click1", {
        volume : 0.4,
      })
    });

    // Set background
    const bgwidth = 1620;
    const bg1 = k.add([
      k.sprite("checker"),
      k.pos(0, 0),
    ]);
    const bg2 = k.add([
      k.sprite("checker"),
      k.pos(bgwidth, 0),
    ]);

    // Frame
    const arcadeframe = k.add([
      k.sprite("arcadeframe"),
      k.scale(0.8),
    ]);
    const arcadeglass = k.add([
      k.sprite("glasspattern"),
      k.scale(0.9),
      k.pos(62, 75),
    ]);

    // Logo 1
    const d1 = k.add([k.sprite("d"), k.scale(0.6), k.pos(200, 190)]);
    const o1 = k.add([k.sprite("o"), k.scale(0.6), k.pos(270, 185)]);
    const n1 = k.add([k.sprite("n"), k.scale(0.6), k.pos(330, 190)]);
    const g1 = k.add([k.sprite("g"), k.scale(0.6), k.pos(400, 190)]);
    // Logo 2
    const d2 = k.add([k.sprite("d"), k.scale(0.6), k.pos(330, 290)]);
    const o2 = k.add([k.sprite("o"), k.scale(0.6), k.pos(400, 285)]);
    const n2 = k.add([k.sprite("n"), k.scale(0.6), k.pos(460, 290)]);
    const g2 = k.add([k.sprite("g"), k.scale(0.6), k.pos(530, 290)]);
    const letters = [d1, o1, n1, g1, d2, o2, n2, g2];
    letters.forEach((letter, i) => {
      gsap.delayedCall(i * 0.15, () => bounce(letter));
    });

    /* ====== BUTTONS ========= */

    // Play button

    const playButton = k.add([
      k.sprite("start"),
      k.scale(0.5),
      k.pos(932, 170),
      k.area()
    ]);
    makeButton(playButton);

    // Tutorial button
    const tutorialButton = k.add([
      k.sprite("tutorial"),
      k.scale(0.5),
      k.pos(890, 280),
      k.area()
    ]);
    makeButton(tutorialButton);

    // Credit button
    const creditsButton = k.add([
      k.sprite("credits"),
      k.scale(0.5),
      k.pos(932, 390),
      k.area()
    ]);
    makeButton(creditsButton);

    // Update Loop
    const speed = 60; // Bg scroll speed
    k.onUpdate(() => {
      const dt = k.dt();

      // Bg scroll loop
      bg1.pos.x -= speed * dt;
      bg2.pos.x -= speed * dt;

      if (bg1.pos.x <= -bgwidth) {
        bg1.pos.x = bg2.pos.x + bgwidth;
      }
      if (bg2.pos.x <= -bgwidth) {
        bg2.pos.x = bg1.pos.x + bgwidth;
      }
    })

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
    "-=0.55"
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
