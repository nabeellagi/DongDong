import gsap from "gsap";

/**
 * @function bounce
 * @description adding GSAP bounce effect
 */
export function bounce(obj) {
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