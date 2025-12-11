/**
 * @function makeButton
 * @description To add button like charateristics to Kaplay sprite.
 * @param {GameObj} obj - Kaplay game object!
 * @param {*} onPress - function to call when the button is pressed
 */

import gsap from "gsap";

export function makeButton(obj, onPress) {
    const baseScaleX = obj.scale.x;
    const baseScaleY = obj.scale.y;

    // Hover animation
    obj.onHover(() => {
        gsap.to(obj.scale, {
            x: baseScaleX * 1.1,
            y: baseScaleY * 1.1,
            duration: 0.2,
            ease: "power3.out",
        });

        gsap.to(obj, {
            angle: 6,
            duration: 0.2,
            ease: "power3.out",
        });
    });

    // Hover ends
    obj.onHoverEnd(() => {
        gsap.to(obj.scale, {
            x: baseScaleX,
            y: baseScaleY,
            duration: 0.2,
            ease: "power3.out",
        });

        gsap.to(obj, {
            angle: 0,
            duration: 0.2,
            ease: "power3.out",
        });
    });

    // Press
    obj.onClick(() => {
        gsap.to(obj.scale, {
            x: baseScaleX * 0.95,
            y: baseScaleY * 0.95,
            duration: 0.15,
            yoyo: true,
            repeat: 1,
            ease: "power2.out",
        });

        if (onPress) onPress();
    });

    return obj;
}
