import { k } from "../core/kaplay";
import { gsap } from "gsap";
import { loadAll } from "../utils/loadAll";

/**
 * Register menu scene
 * 
 * @function registerMenu
 * @description sets up the menu for the game.
 * @example
 * import { registerGame } from "./scenes/game";
 * registerMenu();
*/

export function registerMenu(){
    k.scene("menu", () => {

        // Load assets
        const assets = {
            arcadeframe : '/menu/arcadeframe.png',
            d : '/menu/logo/d.png',
            o :'/menu/logo/o.png',
            n :'/menu/logo/n.png',
            g : '/menu/logo/g.png',
            glasspattern : '/menu/glasspattern.png'
        };
        loadAll(assets);

        // Set background
        k.setBackground(246, 234, 193);

        // Frame
        const arcadeframe = k.add([
            k.sprite("arcadeframe"),
            k.scale(0.8),
            // k.pos(1366/2, 768/2)
        ])
        const arcadeglass = k.add([
            k.sprite("glasspattern"),
            k.scale(0.9),
            k.pos(62, 75)
        ])

        // Logo
        const d1 = k.add([
            k.sprite("d"),
            k.scale(0.4),
            k.pos(190, 190)
        ])
        const o1 = k.add([
            k.sprite("o"),
            k.scale(0.4),
            k.pos(490, 190)
        ])
        // const n1 = k.add([
        //     k.sprite("n"),
        //     k.scale(0.4),
        //     k.pos(190, 190)
        // ])
        // const g1 = k.add([
        //     k.sprite("g"),
        //     k.scale(0.4),
        //     k.pos(190, 190)
        // ])
    })
};