import kaplay from "kaplay";

export const k = kaplay({
    global: false,
    debug: true,
    crisp: true,
    pixelDensity: 1,
    width: 1366,
    height: 768
});

// k.context.imageSmoothingEnabled = false;
k.canvas.style.imageRendering = "pixelated";
k.canvas.style.imageRendering = "crisp-edges";
