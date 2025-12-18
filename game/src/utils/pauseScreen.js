import gsap from "gsap";
import { k } from "../core/kaplay";
import { makeButton } from "./makeButton";

export function pauseScreen({
    onResume,
    onExit
}){
    const root = k.add([
        k.fixed(),
        k.z(200)
    ]);

    const overlay = root.add([
        k.rect(k.width(), k.height()),
        k.pos(0, 0),
        k.color(k.rgb(0, 0, 0)),
        k.opacity(0)
    ]);

    const box = root.add([
        k.rect(520, 320, { radius : 18 }),
        k.pos(k.width()/2, k.height()/2),
        k.anchor("center"),
        k.color("#880C31"),
        k.scale(0.8),
        k.opacity(0)
    ]);

    const title = root.add([
        k.sprite("menu"),
        k.pos(k.width()/2, box.pos.y - 200),
        k.anchor("center"),
        k.scale(0.7),
        k.opacity(0)
    ]);

    const resumeBtn = box.add([
        k.text("RESUME", { size : 42, font : "steve" }),
        k.pos(0, -20),
        k.anchor("center"),
        k.area(),
        k.opacity(0),
        k.scale(1)
    ]);

    const exitBtn = box.add([
        k.text("BACK", { size: 36, font: "steve" }),
        k.pos(0, 60),
        k.anchor("center"),
        k.area(),
        k.opacity(0),
        k.scale(1)
    ]);

    makeButton(resumeBtn, ()=>{
        close();
        onResume?.();
    });

    makeButton(exitBtn, ()=>{
        onExit?.();
    });

    gsap.to(overlay, {
        opacity : 0.7,
        duration : 0.25,
        ease : "power2.out"
    });

    gsap.to(box.scale, {
        x:1,
        y:1,
        duration : 0.35,
        ease : "back.out(2, 5)"
    });

    gsap.to(box, {
        opacity : 1,
        duration : 0.25
    });

    gsap.to(title, {
        opacity : 1,
        y : title.pos.y + 10,
        duration : 0.4, 
        ease : "power2.out"
    });

    gsap.to([resumeBtn, exitBtn], {
        opacity : 1,
        delay : 0.15,
        duration : 0.35
    });

    function close(){
        gsap.to(root, {
            opacity : 0,
            duration : 0.2, 
            onComplete : () => root.destroy()
        });
    }

    return {
        destroy : close
    }
}