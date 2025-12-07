import kaplay from "kaplay";
export const k = kaplay({
    global:false,
    debug:true, 
    crisp:true,
    width : 1366,
    height : 768
});

// k.context.imageSmoothingEnabled = false;
k.canvas.style.imageRendering = "pixelated";