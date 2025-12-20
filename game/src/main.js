import { k } from "./core/kaplay";
import { registerGame } from "./scenes/game";
import { registerLoadingScreen } from "./scenes/loading";
import { registerMenu } from "./scenes/menu";

//Import scenes
registerMenu();
registerGame();
registerLoadingScreen();

k.go('menu');
// k.go('game')
// k.go("loading");