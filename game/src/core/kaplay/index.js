import kaplay from "kaplay";
import { THEMED_ASSETS } from "../data/themed_assets";

export const k = kaplay({
    global: false,
    debug: true,
    crisp: true,
    pixelDensity: 1,
    width: 1366,
    height: 768,
});

k.canvas.style.imageRendering = "pixelated";
k.canvas.style.imageRendering = "crisp-edges";

const loaders = [];

loaders.push(k.loadFont("steve", "fonts/Steve.ttf").loaded);
loaders.push(k.loadFont("silver", "fonts/Silver.ttf").loaded);

for (const [name, path] of Object.entries(THEMED_ASSETS)) {
    if (path.endsWith(".png")) {
        loaders.push(
            k.loadSprite(name, path, { nearest: true }).loaded
        );
    } else if (path.endsWith(".mp3") || path.endsWith(".ogg")) {
        loaders.push(
            k.loadSound(name, path).loaded
        );
    }
}

[
    ["slap1", "sfx/pianohit1.wav"],
    ["slap2", "sfx/pianohit2.wav"],
    ["heavyimpact", "sfx/heavyimpact2.wav"],
    ["whistle", "sfx/whistle.mp3"],
    ["bounce1", "sfx/bounce1.mp3"],
    ["shake", "sfx/shake.mp3"],
    ["count", "sfx/count.mp3"],
    ["blink", "sfx/blink.mp3"],
    ["meow", "sfx/meow.mp3"],
    ["cheer", "sfx/cheer.mp3"],
].forEach(([name, path]) => {
    loaders.push(k.loadSound(name, path).loaded);
});

k.load(Promise.all(loaders));

await Promise.all(loaders);
