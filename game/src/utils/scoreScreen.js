import gsap from "gsap";
import { k } from "../core/kaplay";
import { makeButton } from "./makeButton";

function calculateResult({ playerScore, aiScore }) {
    const ratio = playerScore / Math.max(aiScore, 1);

    // RANK
    let rank = "D";
    if (ratio >= 2.0) rank = "S";
    else if (ratio >= 1.5) rank = "A";
    else if (ratio >= 1.1) rank = "B";
    else if (ratio >= 0.8) rank = "C";

    const winState =
        playerScore > aiScore ? "WIN" :
            playerScore < aiScore ? "LOSE" :
                "DRAW";

    return {
        winState,
        rank,
        ratio
    };
}

export function scoreScreen({
    playerScore,
    aiScore,
    onRestart,
    onExit
}) {
    const { winState, rank } = calculateResult({
        playerScore,
        aiScore
    });

    const root = k.add([
        k.fixed(),
        k.z(300)
    ]);

    // Overlay
    const overlay = root.add([
        k.rect(k.width(), k.height()),
        k.color(k.rgb(0, 0, 0)),
        k.opacity(0)
    ]);

    // Box
    const box = root.add([
        k.rect(640, 500, { radius: 20 }),
        k.pos(k.width() / 2, k.height() / 2),
        k.anchor("center"),
        k.color("#7132CA"),
        k.scale(0.85),
        k.opacity(0)
    ]);

    // WIN OR LOSE DETERMINED
    function spawnFallingResult(text) {
        const letters = text.split("");
        const startX = k.width() / 2 - (letters.length - 1) * 36;

        letters.forEach((char, i) => {
            const letter = root.add([
                k.text(char, { font: "steve", size: 84 }),
                k.pos(startX + i * 72, -100),
                k.anchor("center"),
                // k.color(
                //     winState === "WIN"
                //         ? k.rgb(46, 204, 113)
                //         : k.rgb(231, 76, 60)
                // ),
                k.scale(0.9),
                k.opacity(1)
            ]);

            gsap.to(letter.pos, {
                y: box.pos.y - 190,
                delay: i * 0.08,
                duration: 0.8,
                ease: "bounce.out"
            });
        });
    };
    spawnFallingResult(winState);

    // Score
    const scoreText = box.add([
        k.text(`Your score : ${playerScore}`, {
            size: 48,
            font: "steve"
        }),
        k.pos(0, -40),
        k.anchor("center"),
        k.opacity(0)
    ]);

    // Rank
    const rankText = box.add([
        k.text(`RANK ${rank}`, {
            size: 64,
            font: "steve"
        }),
        k.pos(0, 40),
        k.anchor("center"),
        k.opacity(0),
        k.scale(0.5)
    ]);

    // Buttons
    const restartBtn = box.add([
        k.text("RESTART", {
            size: 36,
            font: "steve"
        }),
        k.pos(0, 120),
        k.anchor("center"),
        k.area(),
        k.opacity(0),
        k.scale(1),
        k.area()
    ]);
    const exitBtn = box.add([
        k.text("EXIT", {
            size: 30,
            font: "steve"
        }),
        k.pos(0, 170),
        k.anchor("center"),
        k.opacity(0),
        k.scale(1),
        k.area()
    ]);

    makeButton(restartBtn, () => {
        close();
        onRestart?.();
    });
    makeButton(exitBtn, () => {
        onExit?.();
    });

    // ANIMATION
    gsap.to(overlay, {
        opacity: 0.75,
        duration: 0.25
    });
    gsap.to(box, {
        opacity: 1,
        duration: 0.3
    });
    gsap.to(box.scale, {
        x: 1,
        y: 1,
        duration: 0.4,
        ease: "back.out(2, 8)"
    });

    gsap.to([scoreText, restartBtn, exitBtn], {
        opacity: 1,
        delay: 0.2,
        duration: 0.3
    });

    gsap.to(rankText, {
        opacity: 1,
        delay: 0.35,
        duration: 0.45,
        ease: "back.out(3)"
    });
    gsap.to(rankText.scale, {
        x: 1,
        y: 1,
    });

    function close() {
        gsap.to(root, {
            opacity: 0,
            duration: 0.2,
            onComplete: () => root.destroy()
        });
    }

    return { destroy: close };
}