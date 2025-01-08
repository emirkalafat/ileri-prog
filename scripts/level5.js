import {
  setLevelConfig,
  initGame,
  startGame,
  endGame,
  restartGame,
  goHome,
  renderLegend,
} from "./common.js";

const level5Config = {
  rowCount: 8,
  columnCount: 10,
  brickWidth: 35.5,
  brickHeight: 15,
  brickPadding: 6,
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
for (let c = 0; c < level5Config.columnCount; c++) {
  customBricks[c] = [];
  for (let r = 0; r < level5Config.rowCount; r++) {
    customBricks[c][r] = {
      x: 0,
      y: 0,
      status: 1,
      type:
        c == 0 ||
        c == level5Config.columnCount - 1 ||
        r == 0 ||
        r == level5Config.rowCount - 1
          ? level5Config.brickTypes[4]
          : c % 2
          ? r % 2
            ? level5Config.brickTypes[0]
            : level5Config.brickTypes[1]
          : r % 2
          ? level5Config.brickTypes[2]
          : level5Config.brickTypes[3],
    };
  }
}
level5Config.bricks = customBricks;

setLevelConfig(level5Config,  5);

initGame();
startGame();

renderLegend(level5Config.brickTypes);

window.restartGame = restartGame;
window.goHome = goHome;
