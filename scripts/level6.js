import {
  setLevelConfig,
  initGame,
  startGame,
  endGame,
  restartGame,
  goHome,
  renderLegend,
} from "./common.js";

const level6Config = {
  rowCount: 10,
  columnCount: 20,
  brickWidth: 20,
  brickHeight: 10,
  brickPadding: 5,
  brickOffsetTop: 50,
  brickOffsetLeft: 20,
  // Farklı tipler istiyorsanız:
  brickTypes: [
    { color: "#82FCB8", score: 49 },
    { color: "#e91e63", score: 42 },
    { color: "#2196f3", score: 23 },
    { color: "#4caf50", score: 14 },
    { color: "#8200B8", score: 1 },
  ],
};

const customBricks = [];
for (let c = 0; c < level6Config.columnCount; c++) {
  customBricks[c] = [];
  if (c == 1) continue;
  if (c == level6Config.columnCount - 1) continue;
  for (let r = 0; r < level6Config.rowCount; r++) {
    if (r == 1) continue;
    if (r == rowCount - 1) continue;
    customBricks[c][r] = {
      x: 0,
      y: 0,
      status: 1,
      type:
        c == 0 ||
        c == level6Config.columnCount - 1 ||
        r == 0 ||
        r == level6Config.rowCount - 1
          ? level6Config.brickTypes[4]
          : c % 2
          ? r % 2
            ? level6Config.brickTypes[0]
            : level6Config.brickTypes[1]
          : r % 2
          ? level6Config.brickTypes[2]
          : level6Config.brickTypes[3],
    };
  }
}
level6Config.bricks = customBricks;

setLevelConfig(level6Config);

initGame();
startGame();

renderLegend(level6Config.brickTypes);

window.restartGame = restartGame;
window.goHome = goHome;
