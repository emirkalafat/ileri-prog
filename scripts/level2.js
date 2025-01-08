import {
  setLevelConfig,
  initGame,
  startGame,
  endGame,
  restartGame,
  goHome,
  renderLegend,
} from "./common.js";

const level2Config = {
  rowCount: 6,
  columnCount: 8,
  brickWidth: 45,
  brickHeight: 15,
  brickPadding: 10,
  brickOffsetTop: 50,
  brickOffsetLeft: 20,
  // Farklı tipler istiyorsanız:
  brickTypes: [
    { color: "#e91e63", score: 40 },
    { color: "#2196f3", score: 30 },
  ],
};

const customBricks = [];
for (let c = 0; c < 8; c++) {
  customBricks[c] = [];
  for (let r = 0; r < 6; r++) {
    customBricks[c][r] = {
      x: 0,
      y: 0,
      status: c == 2 || c == 5 ? 0 : 1,
      type: c % 2 ? level2Config.brickTypes[0] : level2Config.brickTypes[1],
    };
  }
}
level2Config.bricks = customBricks;

setLevelConfig(level2Config,   2);

initGame();
startGame();

renderLegend(level2Config.brickTypes);

window.restartGame = restartGame;
window.goHome = goHome;
