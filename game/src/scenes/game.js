import { k } from "../core/kaplay";
import { gsap } from "gsap";
import { loadAll } from "../utils/loadAll";
import { paddle } from "../objects/paddle";
import { ball } from "../objects/ball";
import { particleTouch } from "../utils/particleTouch";
import { formatTime } from "../utils/formatTime";
import { spawnTrail } from "../utils/spawnTrail";
import { pauseScreen } from "../utils/pauseScreen";
import { theme } from "../core/data/theme";
import { collectThemeAssets } from "../utils/collectThemeAssets";
import { decoyBall } from "../objects/decoyBall";
import { scoreScreen } from "../utils/scoreScreen";

/**
 * Main game loop.
 * @function registerGame
 * @description register the game scene.
 */

export function registerGame() {
    k.scene("game", ({ currentTheme }) => {
        // Game state
        let gameState = "countdown";
        let pauseUI = null;
        let gravityMode = false; // Secret mode

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
        const animateCountdown = (value, color = currentTheme.color1) => {
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
            k.play("count", {
                volume: 0.6
            });
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

        // ===== GAME TIMER STATE =====
        let matchTime = 6 * 60;
        let isOvertime = false;
        let overtimeCount = 0;
        let matchEnded = false;

        // Timer text
        const timerText = k.add([
            k.text(formatTime(matchTime), {
                size: 48,
                font: "steve"
            }),
            k.pos(k.width() / 2, 110),
            k.anchor("center"),
            k.color(currentTheme.color1),
            k.scale(1),
            k.opacity(1),
            k.z(100)
        ]);

        // ==== DECOY SET UP =====
        const decoyPhase = {
            active: false,
            announced: false,
            start: 190,   // seconds after match start
            end: 300,     // seconds after match start
            balls: [],
            count: 5,
        };
        const decoyText = k.add([
            k.text("DECOY", {
                size: 120,
                font: "steve"
            }),
            k.pos(k.width() / 2, k.height() / 2),
            k.anchor("center"),
            k.color(currentTheme.color2),
            k.scale(0),
            k.opacity(0),
            k.z(300)
        ]);
        const showDecoyText = () => {
            gsap.killTweensOf(decoyText);

            decoyText.opacity = 1;
            decoyText.scale = k.vec2(0.2);

            gsap.timeline()
                .to(decoyText.scale, {
                    x: 1.25,
                    y: 1.25,
                    duration: 0.35,
                    ease: "back.out(3)"
                })
                .to(decoyText.scale, {
                    x: 1,
                    y: 1,
                    duration: 0.4,
                    ease: "power2.out"
                })
                .to(decoyText, {
                    opacity: 0,
                    duration: 0.3
                });
        };
        // BLINK EFFECT
        const blinkOverlay = k.add([
            k.rect(k.width(), k.height()),
            k.color(0, 0, 0),
            k.fixed(),
            k.opacity(0),
            k.z(50),
        ]);

        const blinkScreen = () => {
            blinkOverlay.opacity = 1;
            k.play("blink", {
                volume: 0.8
            });
            k.wait(0.5, () => blinkOverlay.opacity = 0);
        };
        // Decoy Helper
        const spawnDecoyBalls = (amount = decoyPhase.count) => {
            for (let i = 0; i < amount; i++) {
                const b = decoyBall(
                    k.width() / 2,
                    k.height() / 2,
                    currentTheme.color2
                );
                b.isFading = false;
                decoyPhase.balls.push(b);
            }
        };
        const clearDecoyBalls = () => {
            decoyPhase.balls.forEach(b => {
                if (!b.exists() || b.isFading) return;

                b.isFading = true;

                gsap.to(b, {
                    opacity: 0,
                    duration: 0.4,
                    ease: "power2.out",
                    onComplete: () => {
                        if (b.exists()) b.destroy();
                    }
                });
            });

            decoyPhase.balls.length = 0;
        };


        // ===== PACE UP =====
        let paceLevel = 0;
        const paceInterval = 60;
        let nextPaceTime = matchTime - paceInterval;
        let paceAnnounced = false;
        // Pace multipliers
        let paddleSizeMul = 1;
        let paddleSpeedMul = 1;
        let aiSpeedMul = 1;


        // Set background
        const bgwidth = 1366;
        const bg1 = k.add([
            k.fixed(),
            k.sprite(currentTheme.background),
            k.pos(0, 0),

        ]);
        const bg2 = k.add([
            k.fixed(),
            k.sprite(currentTheme.background),
            k.pos(bgwidth, 0)
        ]);

        // Set Paddle
        const playerPaddle = paddle(30, k.height() / 2, currentTheme.paddleSprite, 1, "playerPaddle",);
        const oppPaddle = paddle(1330, k.height() / 2, currentTheme.paddleSprite, 1, "oppPaddle");
        oppPaddle.flipX = true; // Flip texture for oppPaddle

        playerPaddle.scale.x = 1.5;
        oppPaddle.scale.x = 1.5;

        // Set ball
        const gameBall = ball(k.width() / 2, k.height() / 2, currentTheme.color2);
        const ballPace = {
            speedMul: 1,
            bounceMul: 1,
            randomnessMul: 1
        };

        // ===== SCORE SYSTEM =====
        let score = {
            player: 0,
            opp: 0,
            isScoring: false
        };

        const scoreColor = {
            player: currentTheme.color1,
            opp: currentTheme.color1
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
                k.scale(1),
                k.z(100)
            ]),
            opp: k.add([
                k.text("0", {
                    size: 64,
                    font: "steve"
                }),
                k.pos(k.width() / 2 + 110, 60),
                k.anchor("center"),
                k.color(scoreColor.opp),
                k.scale(1),
                k.z(100)
            ])
        };

        // gsap.fromTo(textObj.scale,
        //     { x: 0.6, y: 0.6 },
        //     {
        //         x: 1,
        //         y: 1,
        //         duration: 0.4,
        //         ease: "back.out(3)"
        //     }
        // )
        const popScore = (textObj) => {
            gsap.killTweensOf(textObj);
            gsap.killTweensOf(textObj.scale);
            gsap.killTweensOf(textObj.pos);

            const baseY = textObj.pos.y;

            // Safety reset
            textObj.scale.x = 1;
            textObj.scale.y = 1;

            gsap.timeline()

                .to(textObj.scale, {
                    x: 1.12,
                    y: 0.88,
                    duration: 0.1,
                    ease: "power1.out"
                })

                .to(textObj.pos, {
                    y: baseY - 32,
                    duration: 0.3,
                    ease: "power1.out"
                }, "<")
                .to(textObj.scale, {
                    x: 0.95,
                    y: 1.15,
                    duration: 0.3,
                    ease: "power1.out"
                }, "<")

                .to(textObj.scale, {
                    x: 0.05,
                    duration: 0.08,
                    ease: "power1.in"
                }, "<+0.12")
                .to(textObj.scale, {
                    x: -1.05,
                    duration: 0.1,
                    ease: "power1.out"
                })
                .to(textObj.scale, {
                    x: 1,
                    duration: 0.12,
                    ease: "power1.out"
                })

                .to(textObj.pos, {
                    y: baseY,
                    duration: 0.28,
                    ease: "bounce.out"
                })

                .to(textObj.scale, {
                    x: 1.08,
                    y: 0.92,
                    duration: 0.1,
                    ease: "power1.out"
                }, "<")
                .to(textObj.scale, {
                    x: 1,
                    y: 1,
                    duration: 0.18,
                    ease: "elastic.out(1, 0.4)"
                });
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
            });
        };


        // ==== PACE UP =====

        // Pace Text
        const paceText = k.add([
            k.text("PACE UP!", {
                size: 120,
                font: "steve",
            }),
            k.pos(k.width() / 2, k.height() / 2),
            k.anchor("center"),
            k.color(k.rgb(200, 20, 245)),
            k.scale(0),
            k.opacity(0),
            k.z(200)
        ]);
        // Anim pace text

        const paceUp = {
            show: () => {
                gsap.killTweensOf(paceText);

                paceText.opacity = 1;
                paceText.scale.x = 0.2;
                paceText.scale.y = 0.2;
                paceText.pos.y = k.height() / 2;

                gsap.timeline()
                    // Appear n bounce
                    .to(paceText.scale, {
                        x: 1.25,
                        y: 1.25,
                        duration: 0.35,
                        ease: "back.out(3)"
                    })
                    .to(paceText.scale, {
                        x: 1,
                        y: 1,
                        duration: 0.4,
                        ease: "power2.out"
                    })
                    // fall
                    .to(paceText.pos, {
                        y: k.height() + 200,
                        duration: 0.7,
                        ease: "power3.in"
                    })
                    // fade during fall ig
                    .to(paceText, {
                        opacity: 0,
                        duration: 0.35,
                        ease: "power2.out"
                    });

                const whistle = k.play("whistle", {
                    seek: 1,
                    volume: 0.4
                });
                k.wait(0.8, () => whistle.stop());
            },
            apply: () => {
                paceLevel++;

                if (bgm) {
                    bgm.speed = 1 + paceLevel * 0.06;
                };

                // Paddle scaling
                paddleSizeMul *= 0.9;
                paddleSpeedMul += 0.12;
                aiSpeedMul += 0.12;

                playerPaddle.scale.y = paddleSizeMul;
                oppPaddle.scale.y = paddleSizeMul;

                // Ball scaling
                ballPace.speedMul += 0.06;
                ballPace.bounceMul += 0.08;
                ballPace.randomnessMul += 0.05;

            }
        }

        // ===== UPDATE LOOP ======

        //Background scroll vars
        let offset = 0;
        let speed = 20;
        let accel = 3;

        // ===== PADDLE =====
        // Paddle movement properties
        const paddleMove = {
            accel: 1500,
            maxSpeed: 420,
            friction: 280
        };

        const gravity = {
            force: 3000,
            jumpForce: 820,
            maxFallSpeed: 1400,
            groundPadding: 45
        };
        const worldBottomY = () => (k.height() - gravity.groundPadding);


        // ADDITIONAL SET UP FOR GRAVITY MODE
        playerPaddle.velY = 0;
        playerPaddle.isGrounded = false;
        const groundY = k.height() - (playerPaddle.height / 2) - gravity.groundPadding;

        // Burst prop
        const burstConfig = {
            duration: 0.5,
            cooldown: 12,
            paddleOffset: 80,
            maxBallSpeed: 3000, // only during burst
        };
        let trailTimer = 0;
        const trailInterval = 0.025;

        // AI properties
        const ai = {
            reactionDelay: 0.2,
            maxSpeed: 320,
            accel: 1050,
            friction: 260,
            aimError: 30,
            deadZone: 25,
            missChance: 0.3
        }
        const baseAI = { // for decoys
            missChance: ai.missChance,
            aimError: ai.aimError
        };
        let aiTimer = 0;
        let aiTargetY = k.height() / 2;

        // AI BURST SET UP
        let aiBurst = {
            active: false,
            cooldown: false,
            rolled: false
        };

        const activateAIBurst = () => {
            aiBurst.active = true;
            aiBurst.cooldown = true;

            const baseX = oppPaddle.pos.x;
            const burstX = baseX - burstConfig.paddleOffset;

            gsap.killTweensOf(oppPaddle.pos);

            gsap.timeline()
                .to(oppPaddle.pos, {
                    x: burstX - 14,
                    duration: 0.14,
                    ease: "power4.out"
                })
                .to(oppPaddle.pos, {
                    x: burstX,
                    duration: 0.18,
                    ease: "elastic.out(1, 0.4)",
                });

            k.wait(burstConfig.duration, () => {
                aiBurst.active = false;
                gsap.to(oppPaddle.pos, {
                    x: baseX,
                    duration: 0.5,
                    ease: "elastic.out(1, 0.35)"
                })
            });

            k.wait(burstConfig.cooldown, () => {
                aiBurst.cooldown = false;
            });

            k.play("heavyimpact", {
                seek: 0.4,
                volume: 0.2
            });
        }

        // AI PREDICT FUNC
        const predictBallY = (ball, targetX) => {
            const time = (targetX - ball.pos.x) / ball.vel.x;
            if (time < 0) return null; // ball moving awa
            return ball.pos.y + ball.vel.y * time;
        }

        // Bgm
        const bgm = k.play(currentTheme.bgm, {
            volume: 0.5,
            loop: true,
            speed: 1
        });

        // ===== Proud Cat UwU =====
        const spawnProudCat = () => {
            const cat = k.add([
                k.sprite("proudcat"),
                k.pos(k.width() / 2, -80),
                k.anchor("center"),
                k.scale(2.5),
                k.opacity(1),
                k.z(250),
            ]);
            gsap.timeline({
                onComplete: () => cat.destroy()
            })
                .to(cat.pos, {
                    y: k.height() / 2,
                    duration: 0.6,
                    ease: "power2.out",
                    onComplete: () => k.play("meow")
                })
                .to(cat.pos, {
                    y: k.height() / 2 - 60,
                    duration: 0.25,
                    ease: "power2.out",
                    yoyo: true,
                    repeat: 1
                })
                .to(cat, {
                    opacity: 0,
                    duration: 0.4,
                    ease: "power2.out"
                });
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

            const frictionMul = Math.sqrt(paddleSpeedMul); // Pace friction

            // Acceleration Input
            if (!gravityMode) {
                // NORMAL MOVEMENTS
                if (k.isKeyDown("up") || k.isKeyDown("w")) {
                    playerPaddle.velY -= paddleMove.accel * paddleSpeedMul * dt;
                } else if (k.isKeyDown("down") || k.isKeyDown("s")) {
                    playerPaddle.velY += paddleMove.accel * paddleSpeedMul * dt;
                }
                else {
                    // Deceleration
                    if (playerPaddle.velY > 0) {
                        playerPaddle.velY -= paddleMove.friction * frictionMul * dt;
                        if (playerPaddle.velY < 0) playerPaddle.velY = 0;
                    } else if (playerPaddle.velY < 0) {
                        playerPaddle.velY += paddleMove.friction * frictionMul * dt;
                        if (playerPaddle.velY > 0) playerPaddle.velY = 0;
                    }
                }
                // Apply Movement
                playerPaddle.pos.y += playerPaddle.velY * dt;
                // Limit MaxSpeed
                playerPaddle.velY = k.clamp(playerPaddle.velY, -paddleMove.maxSpeed * paddleSpeedMul, paddleMove.maxSpeed * paddleSpeedMul);
                // Keep in screen
                playerPaddle.pos.y = k.clamp(
                    playerPaddle.pos.y,
                    playerPaddle.height / 2,
                    k.height() - playerPaddle.height / 2
                )
            }
            // GRAVITY MODE
            if (gravityMode) {
                // Apply gravity
                playerPaddle.velY += gravity.force * dt;

                playerPaddle.velY = k.clamp(
                    playerPaddle.velY,
                    -Infinity,
                    gravity.maxFallSpeed
                );

                playerPaddle.pos.y += playerPaddle.velY * dt;

                // Ground
                if (playerPaddle.pos.y >= groundY) {
                    playerPaddle.pos.y = groundY;
                    playerPaddle.velY = 0;
                    playerPaddle.isGrounded = true;
                } else {
                    playerPaddle.isGrounded = false;
                }
            }

            // ==== Ball Movement ====
            // Move the ball
            gameBall.pos.x += gameBall.vel.x * dt;
            gameBall.pos.y += gameBall.vel.y * dt;

            // Bounce to wall
            if (gameBall.pos.y <= gameBall.radius) {
                gameBall.pos.y = gameBall.radius;
                const bounceEnergy = k.rand(
                    1.05,
                    1.15 + (ballPace.bounceMul - 1) * 0.4
                );

                gameBall.vel.y *= -bounceEnergy;
                gameBall.vel.y += k.rand(
                    -40 * ballPace.randomnessMul,
                    40 * ballPace.randomnessMul
                )

                k.shake(gameBall.vel.len() / 200);
                k.play("bounce1", {
                    volume: 1.5,
                    speed: k.rand(0.85, 1.2),
                    volume: 0.45
                });
                k.play("shake", {
                    seek: 0.1,
                    volume: 0.3
                });
            };
            const bottomLimit = worldBottomY() - gameBall.radius;

            if (gameBall.pos.y >= bottomLimit) {
                gameBall.pos.y = bottomLimit;

                gameBall.vel.y *= k.rand(-1.25, -1.02);
                gameBall.vel.y += k.rand(-40, 40);

                k.shake(gameBall.vel.len() / 200);
                k.play("bounce1", {
                    speed: k.rand(0.85, 1.2),
                    volume: 0.45
                });
                k.play("shake", {
                    seek: 0.1,
                    volume: 0.3
                });
            };

            // Decoy Ball moves
            for (const b of decoyPhase.balls) {
                b.pos.x += b.vel.x * dt;
                b.pos.y += b.vel.y * dt;

                // World bounce
                if (b.pos.y <= b.radius) {
                    b.pos.y = b.radius;
                    b.vel.y *= -1;
                }
                if (b.pos.y >= k.height() - b.radius) {
                    b.pos.y = k.height() - b.radius;
                    b.vel.y *= -1;
                }

                if (b.pos.x <= b.radius) {
                    b.pos.x = b.radius;
                    b.vel.x *= -1;
                }
                if (b.pos.x >= k.width() - b.radius) {
                    b.pos.x = k.width() - b.radius;
                    b.vel.x *= -1;
                }

                // Paddle collision
                if (b.isColliding(playerPaddle)) {
                    b.vel.x = Math.abs(b.vel.x);
                    b.vel.y += playerPaddle.velY * 0.3;
                }
                if (b.isColliding(oppPaddle)) {
                    b.vel.x = -Math.abs(b.vel.x);
                    b.vel.y += oppPaddle.velY * 0.3;
                }
            };
            // DECOY AI DISTRACTION
            if (decoyPhase.active) {
                ai.missChance = baseAI.missChance + 0.4;
                ai.aimError = baseAI.aimError * 2;
            } else {
                ai.missChance = baseAI.missChance;
                ai.aimError = baseAI.aimError;
            }

            // ===== BURST TRAIL =====
            if (gameBall.justBurst) {
                trailTimer += dt;

                if (trailTimer >= trailInterval) {
                    trailTimer = 0;
                    spawnTrail(gameBall.pos, undefined, 5, gameBall.vel);
                }
            } else {
                trailTimer = 0;
            }

            // ==== BALL SPEED ====
            const normalMaxSpeed = 800 * ballPace.speedMul;
            const ballSpeed = gameBall.vel.len();
            let currentMaxSpeed = normalMaxSpeed;

            if (gameBall.justBurst) {
                currentMaxSpeed = burstConfig.maxBallSpeed; // Burst the ball
            }

            if (ballSpeed > currentMaxSpeed) {
                gameBall.vel = gameBall.vel.unit().scale(currentMaxSpeed);
            }

            const maxVerticalRatio = 0.9;
            gameBall.vel.y = k.clamp(
                gameBall.vel.y,
                -currentMaxSpeed * maxVerticalRatio,
                currentMaxSpeed * maxVerticalRatio
            );

            if (gameBall.justBurst) {
                gameBall.burstTimer -= dt;
                if (gameBall.burstTimer <= 0) {
                    gameBall.justBurst = false;
                }
            }

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
                    if (decoyPhase.active) {
                        blinkScreen();
                        spawnDecoyBalls(2);
                    }
                    resetBallWithDelay(-1);
                    spawnProudCat();
                }
                if (gameBall.pos.x < -limit) {
                    score.opp++;
                    popScore(scoreText.opp);
                    scoreText.opp.text = score.opp.toString();
                    if (decoyPhase.active) {
                        blinkScreen();
                        spawnDecoyBalls(2);
                    }
                    resetBallWithDelay(1);
                }
            };

            // ===== Match Timer =====
            if (gameState === "play" && !matchEnded) {
                matchTime -= dt;
                if (matchTime < 0) matchTime = 0;

                timerText.text = formatTime(matchTime);

                // PACE TIMER

                if (matchTime <= nextPaceTime + 2 && matchTime > nextPaceTime && !paceAnnounced) {
                    paceAnnounced = true;
                    paceUp.show();
                }
                if (matchTime <= nextPaceTime) {
                    paceUp.apply();
                    nextPaceTime -= paceInterval;
                    paceAnnounced = false;
                }

                // DECOY TIMER
                const elapsed = (6 * 60) - matchTime;

                if (
                    elapsed >= decoyPhase.start &&
                    elapsed <= decoyPhase.end
                ) {
                    if (!decoyPhase.active) {
                        decoyPhase.active = true;
                        blinkScreen();
                        showDecoyText();
                        spawnDecoyBalls();
                    }
                } else {
                    if (decoyPhase.active) {
                        decoyPhase.active = false;
                        clearDecoyBalls();
                    }
                }

                // Tense 10 secs
                if (matchTime <= 10 && matchTime > 0) {
                    gsap.to(timerText.scale, {
                        x: 1.15,
                        y: 1.15,
                        duration: 0.2,
                        yoyo: true,
                        repeat: 1,
                        ease: "power2.out"
                    });
                    timerText.color = k.rgb(201, 13, 13);
                };

                // Time's Up!
                if (matchTime === 0) {
                    // Tie
                    if (score.player === score.opp) {
                        overtimeCount++;
                        matchTime = 15; // Additional 15 secs
                        timerText.color = k.rgb(241, 196, 15);
                        gsap.fromTo(timerText.scale,
                            {
                                x: 0.5, y: 0.5
                            },
                            {
                                x: 1, y: 1,
                                duration: 0.6,
                                ease: "elastic.out(1, 0.35)"
                            }
                        );
                    } else { // MATCH ENDS!
                        bgm?.stop();
                        matchEnded = true;
                        gameState = "end";

                        k.wait(0.3, () => {
                            k.play("cheer", {
                                volume: 0.6
                            })
                            scoreScreen({
                                playerScore: score.player,
                                aiScore: score.opp,
                                onRestart: () => {
                                    k.go("game", { currentTheme });
                                },
                                onExit: () => {
                                    k.go("menu");
                                }
                            });
                        })
                    }
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
                    oppPaddle.velY += ai.accel * aiSpeedMul * dt;
                } else {
                    oppPaddle.velY -= ai.accel * aiSpeedMul * dt;
                }
            } else {
                // Friction
                if (oppPaddle.velY > 0) {
                    oppPaddle.velY -= ai.friction * frictionMul * dt;
                    if (oppPaddle.velY < 0) oppPaddle.velY = 0;
                } else if (oppPaddle.velY < 0) {
                    oppPaddle.velY -= ai.friction * frictionMul * dt;
                    if (oppPaddle.velY > 0) oppPaddle.velY = 0;
                }
            }
            // Clamp speed
            oppPaddle.velY = k.clamp(oppPaddle.velY, -ai.maxSpeed * aiSpeedMul, ai.maxSpeed * aiSpeedMul);
            // Apply movement
            oppPaddle.pos.y += oppPaddle.velY * dt;
            // Keep in screen
            oppPaddle.pos.y = k.clamp(
                oppPaddle.pos.y,
                oppPaddle.height / 2,
                k.height() - oppPaddle.height / 2
            );

            // ==== AI BURST DECISION ====
            if (gameBall.vel.x <= 0) {
                aiBurst.rolled = false; // prevent generating random numbers too much
            }
            if (
                !aiBurst.active &&
                !aiBurst.cooldown &&
                gameBall.vel.x > 0 && // ball moving toward AI
                !aiBurst.rolled
            ) {
                const predictedY = predictBallY(gameBall, oppPaddle.pos.x);
                if (predictedY !== null) {
                    const yDiff = Math.abs(predictedY - oppPaddle.pos.y);

                    // how soon ball reaches AI
                    const timeToReach = (oppPaddle.pos.x - gameBall.pos.x) / gameBall.vel.x;

                    const burstChance = 0.05;
                    const chance = Math.random();
                    // k.debug.log(chance);
                    if (
                        yDiff < 40 &&             // precise vertical alignment
                        timeToReach > 0 &&
                        timeToReach < 0.45 &&     // tight timing window
                        chance < burstChance    // randomness (tune this)
                    ) {
                        aiBurst.rolled = true;
                        // k.debug.log(chance);
                        activateAIBurst();
                    }
                }
            }

        });

        // ===== BURST ====
        // Player Burst move
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

            // ==== SPRING DASH FORWARD ====
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

            // ==== END BURST ====
            k.wait(burstConfig.duration, () => {
                playerBurst.active = false;
                // Springy return
                gsap.to(playerPaddle.pos, {
                    x: baseX,
                    duration: 0.5,
                    ease: "elastic.out(1, 0.35)",
                });
            });

            // ==== COOLDOWN ====
            k.wait(burstConfig.cooldown, () => {
                playerBurst.cooldown = false;
            });
            k.play("heavyimpact", {
                seek: 0.4,
                volume: 0.2
            })
        };

        k.onKeyPress("right", () => {
            if (playerBurst.active || playerBurst.cooldown || gameState !== "play") return;
            activateBurst();
        });

        // Paddle collide
        gameBall.onCollide("playerPaddle", () => {
            // BURST COLLIDE
            if (playerBurst.active) {
                const dir = Math.sign(gameBall.vel.x) || 1;

                const angle = k.rand(-0.5, 0.5);
                const speed = burstConfig.maxBallSpeed;

                const paddleEdgeX = playerPaddle.pos.x + playerPaddle.width / 2 + gameBall.radius + 2;
                gameBall.pos.x = paddleEdgeX;

                gameBall.vel = k.vec2(
                    Math.abs(speed),
                    speed * angle
                );

                gameBall.justBurst = true;
                gameBall.burstTimer = 0.25;
            }
            else {
                const retention = 1 + (ballPace.bounceMul - 1) * 0.15;
                gameBall.vel.x *= k.rand(-1.1, -1.02) * retention;
                gameBall.vel.y += playerPaddle.velY * (0.35 + paceLevel * 0.02);
            }
            particleTouch(gameBall.pos.x, gameBall.pos.y);

            k.play("slap1", {
                speed: k.rand(0.95, 1.1),
                seek: 0.001,
                volume: 2
            });
        });
        gameBall.onCollide("oppPaddle", () => {
            if (aiBurst.active) {
                const angle = k.rand(-0.45, 0.45);
                const speed = burstConfig.maxBallSpeed;

                const paddleEdgeX =
                    oppPaddle.pos.x - oppPaddle.width / 2 - gameBall.radius - 2;

                gameBall.pos.x = paddleEdgeX;

                gameBall.vel = k.vec2(
                    -Math.abs(speed),
                    speed * angle
                );

                gameBall.justBurst = true;
                gameBall.burstTimer = 0.25;
            } else {
                const retention = 1 + (ballPace.bounceMul - 1) * 0.15;
                gameBall.vel.x *= k.rand(-1.1, -1.02) * retention;
                gameBall.vel.y += oppPaddle.velY * (0.35 + paceLevel * 0.02);
            }

            particleTouch(gameBall.pos.x, gameBall.pos.y);

            k.play("slap2", {
                speed: k.rand(0.95, 1.1),
                seek: 0.001,
                volume: 2
            });
        });

        // ===== PAUSE =====
        k.onKeyPress('q', () => {
            if (gameState === "play") {
                gameState = "pause";

                pauseUI = pauseScreen({
                    onResume: () => {
                        gameState = "play";
                        pauseUI = null;
                    },
                    onExit: () => {
                        k.go("menu");
                    }
                })
            } else if (gameState === "pause") {
                pauseUI?.destroy();
                pauseUI = null;
                gameState = "play";
            }
        });

        // Toggle Gravity Mode
        k.onKeyPress("g", () => {
            if (gameState === "countdown") {
                blinkScreen();
                gravityMode = true;
            }
        });
        k.onKeyPress("up", () => {
            if (!gravityMode || gameState !== "play") return;
            playerPaddle.velY = -gravity.jumpForce;
        });
        k.onSceneLeave(() => {
            bgm?.stop();
        })
    });
}