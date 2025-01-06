import {
  setLevelConfig,
  initGame,
  startGame,
  endGame,
  restartGame,
  goHome,
  renderLegend,
} from "./common.js";

// Örnek config: Bu level için 5 satır, 7 sütun
// Blokların boyutu, satırlar, sütunlar vs.
const level1Config = {
  rowCount: 5,
  columnCount: 7,
  brickWidth: 50,
  brickHeight: 15,
  brickPadding: 10,
  brickOffsetTop: 30,
  brickOffsetLeft: 30,
  brickTypes: [
    { color: "#e53935", score: 30 },
    { color: "#1e88e5", score: 20 },
    { color: "#9c27b0", score: 10 },
  ],
};

// Seviye konfigürasyonunu common.js’e iletelim
setLevelConfig(level1Config);

// Oyun başlangıç ayarları (eventListener fln.)
initGame();

// Oyunu başlat
startGame();

renderLegend(level1Config.brickTypes);

// Aşağıdaki fonksiyonları HTML’de doğrudan “onclick” ile çağırıyorsanız
// global scope’a da açmanız gerekebilir:
window.restartGame = restartGame;
window.goHome = goHome;
