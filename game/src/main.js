import { k } from "./core/kaplay";
import { registerGame } from "./scenes/game";
import { registerLoadingScreen } from "./scenes/loading";
import { registerMenu } from "./scenes/menu";
import { registerTutorial } from "./scenes/tutorial";

//Import scenes
registerMenu();
registerGame();
registerLoadingScreen();
registerTutorial();

k.go('menu');
// k.go('game')
// k.go("loading");