import { k } from "../core/kaplay";
import { bounce } from "../utils/bounce";

export function registerLoadingScreen() {
    k.scene("loading", () => {

        k.add([
            k.sprite("checker"),
            k.pos(0, 0),
        ]);

        const loadText = k.add([
            k.text("Loading...", {
                font: "steve",
                size: 60,
            }),
            k.anchor("center"),
            k.pos(k.width() / 2, k.height() / 2),
            k.color("#410a00"),
            k.scale(1),
        ]);

        bounce(loadText);

        k.onClick(() => {
            k.audioCtx?.resume();
        });

        k.wait(2, () => {
            loadText.text = "Ready!";
            k.wait(0.5, () => {
                k.go("game");
            });
        });
    });
}
