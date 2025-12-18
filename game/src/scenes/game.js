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

/**
 * Main game loop.
 * @function registerGame
 * @description register the game scene.
 */

export function registerGame() {
    k.scene("game", () => {

        // ===== THEME SELECT =====
        const currentTheme = theme[Math.floor(Math.random() * theme.length)];
        // const currentTheme = theme[2];

        // Game state
        let gameState = "countdown";
        let pauseUI = null;

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
            k.z(99)
        ]);

        // ===== PACE UP =====
        let paceLevel = 0;
        const paceInterval = 60;
        let nextPaceTime = matchTime - paceInterval;
        let paceAnnounced = false;
        // Pace multipliers
        let paddleSizeMul = 1;
        let paddleSpeedMul = 1;
        let aiSpeedMul = 1;

        // ===== LOAD ASSETS =====
        const assets = {
            // BACKGROUND
            brick: "/game/brick1.png",
            wave : "/game/wave.png",
            circ : "/game/circ.png",
            sprink : "/game/sprink.png",

            menu : "/menu/menu.png",

            // PADDLE SKIN
            capybara : "/sprites/paddleskin/c.png",
            whale : "/sprites/paddleskin/w.png",
            frog : "/sprites/paddleskin/f.png",
            axolotl : "/sprites/paddleskin/a.png",
            
        }
        loadAll(assets);

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
        const playerPaddle = paddle(30, k.height() / 2, currentTheme.paddleSprite, 1, "playerPaddle", );
        const oppPaddle = paddle(1330, k.height() / 2, currentTheme.paddleSprite, 1, "oppPaddle");
        oppPaddle.flipX = true; // Flip texture for oppPaddle

        playerPaddle.scale.x = 1.5;
        oppPaddle.scale.x = 1.5;

        // Set ball
        const gameBall = ball(k.width() / 2, k.height() / 2, currentTheme.color2);

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
                    })
            },
            apply: () => {
                paceLevel++;

                paddleSizeMul *= 0.9;

                paddleSpeedMul += 0.12;
                aiSpeedMul += 0.12;

                playerPaddle.scale.y = paddleSizeMul;
                oppPaddle.scale.y = paddleSizeMul;
            }
        }

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
        }

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

            const frictionMul = Math.sqrt(paddleSpeedMul); // Pace friction

            // Acceleration Input
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
            const normalMaxSpeed = 800;
            const ballSpeed = gameBall.vel.len();
            let currentMaxSpeed = normalMaxSpeed;

            if (gameBall.justBurst) {
                currentMaxSpeed = burstConfig.maxBallSpeed; // Burst the ball
            }

            if (ballSpeed > currentMaxSpeed) {
                gameBall.vel = gameBall.vel.unit().scale(currentMaxSpeed);
            }

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
                    resetBallWithDelay(-1);
                }
                if (gameBall.pos.x < -limit) {
                    score.opp++;
                    popScore(scoreText.opp);
                    scoreText.opp.text = score.opp.toString();
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
                        matchEnded = true;
                        gameState = "end";

                        k.wait(0.3, () => {
                            if (score.player > score.opp) { // Player Win
                                alert("win");
                            } else { // Opp win
                                alert("lose")
                            }
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
                gameBall.vel.x *= k.rand(-1.25, -1.02);
                gameBall.vel.y += playerPaddle.velY * 0.35;
            }
            particleTouch(gameBall.pos.x, gameBall.pos.y);
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
                gameBall.vel.x *= k.rand(-1.25, -1.02);
                gameBall.vel.y += oppPaddle.velY * 0.35;
            }

            particleTouch(gameBall.pos.x, gameBall.pos.y);
        });

        // ===== PAUSE =====
        k.onKeyPress('q', () => {
            if(gameState === "play"){
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
            }else if(gameState === "pause"){
                pauseUI?.destroy();
                pauseUI = null;
                gameState = "play";
            }
        })

    });
}