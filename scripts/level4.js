import {
  setLevelConfig,
  initGame,
  startGame,
  endGame,
  restartGame,
  goHome,
  renderLegend,
} from "./common.js";

const level4Config = {
  rowCount: 6,
  columnCount: 16,
  brickWidth: 22,
  brickHeight: 15,
  brickPadding: 5,
  brickOffsetTop: 50,
  brickOffsetLeft: 20,
  // Farklı tipler istiyorsanız:
  brickTypes: [
    { color: "#82FCB8", score: 50 },
    { color: "#e91e63", score: 40 },
    { color: "#2196f3", score: 30 },
    { color: "#4caf50", score: 20 },
    { color: "#ffeb3b", score: 10 },
  ],
};

const customBricks = [];
for (let c = 0; c < level4Config.columnCount; c++) {
  customBricks[c] = [];
  for (let r = 0; r < level4Config.rowCount; r++) {
    customBricks[c][r] = {
      x: 0,
      y: 0,
      status: 1,
      type:
        c == 0 ||
        c == level4Config.columnCount - 1 ||
        r == 0 ||
        r == level4Config.rowCount - 1
          ? level4Config.brickTypes[4]
          : c % 2
          ? r % 2
            ? level4Config.brickTypes[0]
            : level4Config.brickTypes[1]
          : r % 2
          ? level4Config.brickTypes[2]
          : level4Config.brickTypes[3],
    };
  }
}
level4Config.bricks = customBricks;

setLevelConfig(level4Config);

initGame();
startGame();

renderLegend(level4Config.brickTypes);

window.restartGame = restartGame;
window.goHome = goHome;
