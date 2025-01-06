import {
  setLevelConfig,
  initGame,
  startGame,
  endGame,
  restartGame,
  goHome,
  renderLegend,
} from "./common.js";

const level3Config = {
  rowCount: 6,
  columnCount: 16,
  brickWidth: 22,
  brickHeight: 15,
  brickPadding: 5,
  brickOffsetTop: 50,
  brickOffsetLeft: 20,
  // Farklı tipler istiyorsanız:
  brickTypes: [
    { color: "#e91e63", score: 40 },
    { color: "#2196f3", score: 30 },
    { color: "#4caf50", score: 20 },
    { color: "#ffeb3b", score: 10 },
  ],
};

const customBricks = [];
for (let c = 0; c < level3Config.columnCount; c++) {
  customBricks[c] = [];
  for (let r = 0; r < level3Config.rowCount; r++) {
    customBricks[c][r] = {
      x: 0,
      y: 0,
      status: 1,
      type:
        c % 2
          ? r % 2
            ? level3Config.brickTypes[0]
            : level3Config.brickTypes[1]
          : r % 2
          ? level3Config.brickTypes[2]
          : level3Config.brickTypes[3],
    };
  }
}
level3Config.bricks = customBricks;

setLevelConfig(level3Config);

initGame();
startGame();

renderLegend(level3Config.brickTypes);

window.restartGame = restartGame;
window.goHome = goHome;
