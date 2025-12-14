import { k } from "../core/kaplay";
import { gsap } from "gsap";
import { loadAll } from "../utils/loadAll";
import { paddle } from "../objects/paddle";
import { ball } from "../objects/ball";
import { particleTouch } from "../utils/particleTouch";

/**
 * Main game loop.
 * @function registerGame
 * @description register the game scene.
 */

export function registerGame() {
    k.scene("game", () => {

        // Game state
        let gameState = "countdown";

        // Countdown
        let countdown = 3;
        const countdownText = k.add([
            k.text(countdown.toString(), {
                size: 105,
                font: "steve"
            }),
            k.pos(k.width() / 2, k.height() / 2 - 100),
            k.anchor("center"),
            k.z(100),
            k.scale(1),
            k.opacity(1)
        ]);
        const animateCountdown = (value, color = k.rgb(212, 53, 25)) => {
            countdownText.text = value;
            countdownText.color = color;
            gsap.killTweensOf(countdownText);
            gsap.killTweensOf(countdownText.scale);

            countdownText.opacity = 0;
            countdownText.scale.x = 0.2;
            countdownText.scale.y = 0.2;

            gsap.to(countdownText, {
                opacity: 1,
                duration: 0.15,
                ease: "power2.out"
            });
            gsap.to(countdownText.scale, {
                x: 1,
                y: 1,
                duration: 0.45,
                ease: "back.out(3)"
            });
        };
        const startCountdown = () => {
            animateCountdown("3");
            k.wait(1, () => animateCountdown("2"));
            k.wait(2, () => animateCountdown("1"));
            k.wait(3, () => animateCountdown("GO", k.rgb(46, 204, 113)));

            k.wait(3.8, () => {
                gsap.to(countdownText, {
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => {
                        countdownText.destroy();
                        gameState = "play";
                    }
                })
            })
        };
        startCountdown();

        // Load assets
        const assets = {
            brick: "/game/brick1.png"
        }
        loadAll(assets);

        // Set background
        const bgwidth = 1620;
        const bg1 = k.add([
            k.sprite("brick"),
            k.pos(0, 0),

        ]);
        const bg2 = k.add([
            k.sprite("brick"),
            k.pos(bgwidth, 0)
        ]);

        // Set Paddle
        const playerPaddle = paddle(30, k.height() / 2, "playerPaddle");
        const oppPaddle = paddle(1330, k.height() / 2, "oppPaddle");

        // Set ball
        const gameBall = ball(k.width() / 2, k.height() / 2);

        // ===== SCORE SYSTEM =====
        let score = {
            player: 0,
            opp: 0,
            isScoring: false
        };

        const scoreColor = {
            player: k.rgb(212, 53, 25),
            opp: k.rgb(212, 53, 25)
        };

        const scoreText = {
            player: k.add([
                k.text("0", {
                    size: 64,
                    font: "steve"
                }),
                k.pos(k.width() / 2 - 120, 60),
                k.anchor("center"),
                k.color(scoreColor.player),
                k.scale(1)
            ]),
            opp: k.add([
                k.text("0", {
                    size: 64,
                    font: "steve"
                }),
                k.pos(k.width() / 2 + 110, 60),
                k.anchor("center"),
                k.color(scoreColor.opp),
                k.scale(1)
            ])
        };

        const popScore = (textObj) => {
            gsap.fromTo(textObj.scale,
                { x: 0.6, y: 0.6 },
                {
                    x: 1,
                    y: 1,
                    duration: 0.4,
                    ease: "back.out(3)"
                }
            )
        };

        // Ball reset function
        const resetBallWithDelay = (dir) => {
            score.isScoring = true;

            // Freeze ball
            gameBall.vel = k.vec2(0, 0);

            k.wait(0.8, () => {
                gameBall.pos = k.vec2(k.width() / 2, k.height() / 2);
                // Throw
                gameBall.vel = k.vec2(
                    dir * 500,
                    k.rand(-100, 100)
                );

                score.isScoring = false;
            })
        };

        // ===== UPDATE LOOP ======

        //Background scroll vars
        let offset = 0;
        let speed = 20;
        let accel = 3;

        // Paddle movement properties
        const paddleMove = {
            accel: 1500,
            maxSpeed: 420,
            friction: 280
        };

        // Burst prop
        const burstConfig = {
            duration: 0.5,
            cooldown: 12,
            paddleOffset: 80,
            maxBallSpeed: 1600, // only during burst
        };

        // AI properties
        const ai = {
            reactionDelay: 0.2,
            maxSpeed: 320,
            accel: 1050,
            friction: 260,
            aimError: 30,
            deadZone: 25,
            missChance: 0.15
        }
        let aiTimer = 0;
        let aiTargetY = k.height() / 2;

        // AI PREDICT FUNC
        const predictBallY = (ball, targetX) => {
            const time = (targetX - ball.pos.x) / ball.vel.x;
            if (time < 0) return null; // ball moving awa
            return ball.pos.y + ball.vel.y * time;
        }

        k.onUpdate(() => {
            const dt = k.dt();

            // Game state
            if (gameState !== "play") return;

            // Background scroll animation
            speed += accel * dt;
            offset -= speed * dt;
            offset %= bgwidth;

            bg1.pos.x = offset;
            bg2.pos.x = offset + bgwidth;

            // ==== PlayerPaddle move =====

            // Acceleration Input
            if (k.isKeyDown("up") || k.isKeyDown("w")) {
                playerPaddle.velY -= paddleMove.accel * dt;
            } else if (k.isKeyDown("down") || k.isKeyDown("s")) {
                playerPaddle.velY += paddleMove.accel * dt;
            }
            else {
                // Deceleration
                if (playerPaddle.velY > 0) {
                    playerPaddle.velY -= paddleMove.friction * dt;
                    if (playerPaddle.velY < 0) playerPaddle.velY = 0;
                } else if (playerPaddle.velY < 0) {
                    playerPaddle.velY += paddleMove.friction * dt;
                    if (playerPaddle.velY > 0) playerPaddle.velY = 0;
                }
            }
            // Apply Movement
            playerPaddle.pos.y += playerPaddle.velY * dt;
            // Limit MaxSpeed
            playerPaddle.velY = k.clamp(playerPaddle.velY, -paddleMove.maxSpeed, paddleMove.maxSpeed);
            // Keep in screen
            playerPaddle.pos.y = k.clamp(
                playerPaddle.pos.y,
                playerPaddle.height / 2,
                k.height() - playerPaddle.height / 2
            )

            // ==== Ball Movement ====
            // Move the ball
            gameBall.pos.x += gameBall.vel.x * dt;
            gameBall.pos.y += gameBall.vel.y * dt;

            // Bounce to wall
            if (gameBall.pos.y <= gameBall.radius) {
                gameBall.pos.y = gameBall.radius;
                gameBall.vel.y *= k.rand(-1.25, -1.02);
                gameBall.vel.y += k.rand(-40, 40);

                k.shake(gameBall.vel.len() / 200);
            };
            if (gameBall.pos.y >= k.height() - gameBall.radius) {
                gameBall.pos.y = k.height() - gameBall.radius;
                gameBall.vel.y *= k.rand(-1.25, -1.02);
                gameBall.vel.y += k.rand(-40, 40);

                k.shake(gameBall.vel.len() / 200);
            };

            // Clamp ball speed
            const normalMaxSpeed = 900;
            const burstMaxSpeed = burstConfig.maxBallSpeed;

            const currenntMaxSpeed = playerBurst.active ? burstMaxSpeed : normalMaxSpeed;

            const ballSpeed = gameBall.vel.len();
            if(ballSpeed > currenntMaxSpeed) gameBall.vel = gameBall.vel.unit().scale(currenntMaxSpeed);

            // const maxBallSpeed = 900;
            // const ballSpeed = gameBall.vel.len();
            // if (ballSpeed > maxBallSpeed) gameBall.vel = gameBall.vel.unit().scale(maxBallSpeed);

            // Reset Ball
            const limit = 60; // x limit ball pass
            if (!score.isScoring) {
                if (gameBall.pos.x > k.width() + limit) {
                    score.player++;
                    popScore(scoreText.player);
                    scoreText.player.text = score.player.toString();
                    resetBallWithDelay(-1);
                }
                if (gameBall.pos.x < -limit) {
                    score.opp++;
                    popScore(scoreText.opp);
                    scoreText.opp.text = score.opp.toString();
                    resetBallWithDelay(1);
                }
            }

            // ==== AI ====
            // AI logic
            aiTimer += dt;
            if (aiTimer >= ai.reactionDelay) {
                aiTimer = 0;

                const predictedY = predictBallY(gameBall, oppPaddle.pos.x);
                if (predictedY !== null) {
                    aiTargetY = predictedY + k.rand(-ai.aimError, ai.aimError);
                    // Miss
                    if (Math.random() < ai.missChance) {
                        aiTargetY += k.rand(-200, 200)
                    }
                }
            }
            // AI Move
            const dy = aiTargetY - oppPaddle.pos.y;
            if (Math.abs(dy) > ai.deadZone) {
                if (dy > 0) {
                    oppPaddle.velY += ai.accel * dt;
                } else {
                    oppPaddle.velY -= ai.accel * dt;
                }
            } else {
                // Friction
                if (oppPaddle.velY > 0) {
                    oppPaddle.velY -= ai.friction * dt;
                    if (oppPaddle.velY < 0) oppPaddle.velY = 0;
                } else if (oppPaddle.velY < 0) {
                    oppPaddle.velY -= ai.friction * dt;
                    if (oppPaddle.velY > 0) oppPaddle.velY = 0;
                }
            }
            // Clamp speed
            oppPaddle.velY = k.clamp(oppPaddle.velY, -ai.maxSpeed, ai.maxSpeed);
            // Apply movement
            oppPaddle.pos.y += oppPaddle.velY * dt;
            // Keep in screen
            oppPaddle.pos.y = k.clamp(
                oppPaddle.pos.y,
                oppPaddle.height / 2,
                k.height() - oppPaddle.height / 2
            );
        });

        // Burst move
        let playerBurst = {
            active: false,
            cooldown: false
        };
        const activateBurst = () => {
            playerBurst.active = true;
            playerBurst.cooldown = true;

            const baseX = playerPaddle.pos.x;
            const burstX = baseX + burstConfig.paddleOffset;

            // Kill previous tweens (important)
            gsap.killTweensOf(playerPaddle.pos);

            // === SPRING DASH FORWARD ===
            gsap.timeline()
                .to(playerPaddle.pos, {
                    x: burstX + 14, // overshoot
                    duration: 0.14,
                    ease: "power4.out",
                })
                .to(playerPaddle.pos, {
                    x: burstX,
                    duration: 0.18,
                    ease: "elastic.out(1, 0.4)",
                });

            // === END BURST ===
            k.wait(burstConfig.duration, () => {
                playerBurst.active = false;
                // Springy return
                gsap.to(playerPaddle.pos, {
                    x: baseX,
                    duration: 0.5,
                    ease: "elastic.out(1, 0.35)",
                });
            });

            // === COOLDOWN ===
            k.wait(burstConfig.cooldown, () => {
                playerBurst.cooldown = false;
            });
        };

        k.onKeyPress("space", () => {
            if (playerBurst.active || playerBurst.cooldown || gameState !== "play") return;
            activateBurst();
        });

        // Paddle collide
        gameBall.onCollide("playerPaddle", () => {
            if (playerBurst.active) {
                gameBall.vel.x *= -5;
                gameBall.vel.y *= 3;
            }
            else {
                gameBall.vel.x *= k.rand(-1.25, -1.02);
                gameBall.vel.y += playerPaddle.velY * 0.35;
            }
            particleTouch(gameBall.pos.x, gameBall.pos.y);
        });
        gameBall.onCollide("oppPaddle", () => {
            gameBall.vel.x *= k.rand(-1.25, -1.02);
            gameBall.vel.y += oppPaddle.velY * 0.35;
            particleTouch(gameBall.pos.x, gameBall.pos.y);
        });

    });
}