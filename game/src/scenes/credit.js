import gsap from "gsap";
import { k } from "../core/kaplay";
import { makeButton } from "../utils/makeButton";

export function registerCredit() {
    k.scene("credit", () => {
        // ===== SET BG again =====
        const bgwidth = 1620;
        const bg1 = k.add([
            k.sprite("checker"),
            k.pos(0, 0)
        ]);
        const bg2 = k.add([
            k.sprite("checker"),
            k.pos(bgwidth, 0)
        ]);
        let offset = 0;
        let speed = 35;
        let accel = 2;

        // ==== SET BOX ====
        const box = k.add([
            k.rect(900, 600, { radius: 22 }),
            k.pos(k.width() / 2, k.height() / 2),
            k.anchor("center"),
            k.color("#880C31"),
            k.scale(0.8),
            k.opacity(0)
        ]);
        gsap.to(box.scale, {
            x: 1,
            y: 1,
            duration: 0.35,
            ease: "back.out(2, 5)"
        });
        gsap.to(box, {
            opacity: 1,
            duration: 0.25
        });

        // ===== TEXTS =====
        // Title
        const title = box.add([
            k.text("Credits!", {
                font: "steve",
                size: 55,
            }),
            k.pos(0, -box.height / 2 + 50),
            k.anchor("center"),
        ]);

        let contentText = `
Made with Kaplay.Js (successor of Kaboom.js) and Resprite (pixelart editor)
SFX from :
    1. Pixabay
    2. Chhoffmusic on itch io
Music by :
    1. Juanjo_sound on itch io
    2. Jhawk studios on itch io
        `
        const content = box.add([
            k.text(contentText, {
                font: "silver",
                size: 35,
                width: box.width - 80,
                lineSpacing: 7
            }),
            k.pos(-box.width / 2 + 40, -box.height / 2 + 120),
            k.anchor("topleft")
        ]);

        const returnBtn = k.add([
            k.text("RETURN", {
                font: "steve",
                size: 32
            }),
            k.pos(80, k.height() - 80),
            k.anchor("left"),
            k.color("#880C31"),
            k.area(),
            k.scale(1)
        ]);
        makeButton(returnBtn, () => k.go("menu"));

        // ==== UPDATE ====
        k.onUpdate(() => {
            const dt = k.dt();
            // Background scroll
            speed += accel * dt;
            offset -= speed * dt;
            offset %= bgwidth;

            bg1.pos.x = offset;
            bg2.pos.x = offset + bgwidth;
        });
    })
};