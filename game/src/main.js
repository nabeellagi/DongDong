import { k } from "./core/kaplay";
import { registerGame } from "./scenes/game";
import { registerMenu } from "./scenes/menu";

//Import scenes
registerMenu();
registerGame();

k.go('menu');
// k.go('game')