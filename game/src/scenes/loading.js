import { theme } from "../core/data/theme";
import { k } from "../core/kaplay"
import { bounce } from "../utils/bounce";
import { collectThemeAssets } from "../utils/collectThemeAssets";
import { loadAll } from "../utils/loadAll";

export function registerLoadingScreen() {
    k.scene("loading", async () => {
        // Set background
        const bgwidth = 1620;
        const bg1 = k.add([
            k.sprite("checker"),
            k.pos(0, 0),
        ]);

        // Loading text
        const loadText = k.add([
            k.text("Loading...", {
                font: "steve",
                size: 60,
            }),
            k.anchor("center"),
            k.pos(k.width() / 2, k.height() / 2),
            k.color("#410a00"),
            k.scale(1)
        ]);
        bounce(loadText);

        loadAll({
            menu: "/menu/menu.png",
            checker: "/menu/checker1.png",
        });

        const currentTheme = theme[Math.floor(Math.random() * theme.length)];
        const assets = collectThemeAssets(currentTheme);
        loadAll(assets);

        // Sounds
        k.loadSound("slap", "/sfx/slap.wav");
        k.loadSound("heavyimpact", "/sfx/heavyimpact2.wav");
        k.loadSound("whistle", "/sfx/whistle.mp3");
        k.loadSound("bounce1", "/sfx/bounce1.mp3");
        k.loadSound("shake", "/sfx/shake.mp3");
        k.loadSound("count", "/sfx/count.mp3");

        k.onClick(() => {
            k.audioCtx?.resume();
        });

        await k.loadRoot;

        loadText.text = "Ready!";

        k.wait(1, () => {
            k.go("game", { currentTheme })
        }
        );
    })
};