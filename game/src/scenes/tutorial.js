import gsap from "gsap";
import { k } from "../core/kaplay"

/**
 * Tutorial page
 * @function registerTutorial 
 * @description sets up tutorial page.
 */

function moveSlide(direction, length, currentIndex) {
    if (direction === "right") {
        return (currentIndex + 1) % length;
    }

    if (direction === "left") {
        return (currentIndex - 1 + length) % length;
    }

    return currentIndex;
}

export function registerTutorial() {
    k.scene("tutorial", () => {


        // ===== TUTORIAL CONTENT =====
        const tutoriel = [
            {
                title: "How to play?",
                content: `
The goal is simple : score more points than your opponent before the time runs out!
- Move your paddle using :
    UP to move up
    DOWN to move down
Your paddle DOES NOT stop instantly.
It accelerates when you move and slows down because of the friction. Smooth control and positioning matters!
There will be little cat that cheers for you everytime you scored!
                `
            },
            {
                title: "Burst Mechanic",
                content: `
Press Right Arrow key to activate burst
- Burst makes your paddle dash forward for short period of time!
- If you hit the ball, it launches faster
- Burst has cooldown, so be aware of your timing
                `
            },
            {
                title: "Pace up!",
                content: `
Every minute after the game starts:
- The paddle size will shrink
- Your movement get faster
- The ball got bouncier
                `
            },
            {
                title: "Decoy Phase",
                content: `
During certain moments of the match, Decoy Balls will appear!
- Only ONE ball can score
- Decoy ball exists to distract you!
So focus only to one ball.
                `
            },
            {
                title: "Secret gravity mode!",
                content: `
There is a hidden mode in this game...
Try pressing 'g' during the countdown, before the match starts!
                `
            }
        ];
        let index = 0;

        // ===== SET BACKGROUND =====
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

        // ===== SET BOX =====
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
            k.text(tutoriel[index].title, {
                font: "steve",
                size: 55,
            }),
            k.pos(0, -box.height / 2 + 50),
            k.anchor("center"),
        ]);
        const content = box.add([
            k.text(tutoriel[index].content, {
                font: "silver",
                size: 35,
                width: box.width - 80,
                lineSpacing: 7
            }),
            k.pos(-box.width / 2 + 40, -box.height / 2 + 120),
            k.anchor("topleft")
        ]);

        k.add([
            k.text("Press right and left key to move the slide", {
                font: "steve",
                size: 32
            }),
            k.pos(k.width() / 2, 30),
            k.anchor("top"),
            k.color("#880C31"),
        ]);

        const returnBtn = k.add([
            k.text("RETURN", {
                font: "steve",
                size: 32
            }),
            k.pos(80, k.height() - 80),
            k.anchor("left"),
            k.color("#880C31"),
            k.area()
        ]).onClick(() => {
            k.go("menu");
        });

        k.onUpdate(() => {
            const dt = k.dt();
            // Background scroll
            speed += accel * dt;
            offset -= speed * dt;
            offset %= bgwidth;

            bg1.pos.x = offset;
            bg2.pos.x = offset + bgwidth;
        });

        k.onKeyPress("right", () => {
            index = moveSlide("right", tutoriel.length, index);

            title.text = tutoriel[index].title;
            content.text = tutoriel[index].content ?? "";
        });

        k.onKeyPress("left", () => {
            index = moveSlide("left", tutoriel.length, index);

            title.text = tutoriel[index].title;
            content.text = tutoriel[index].content ?? "";
        });


    })
}