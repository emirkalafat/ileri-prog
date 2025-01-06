import { saveScore, getScores } from "./firebase.js";

/* -------------------------------------
   HTML Elemanları
-------------------------------------- */
export const canvas = document.getElementById("gameCanvas");
export const ctx = canvas.getContext("2d");

export const scoreBoard = document.getElementById("scoreBoard");
export const scoreTableBody = document.getElementById("scoreTableBody");

/**
  Eğer HTML’de “Skor Tablosu” butonunuz varsa
  ona da referans alıp, tıklayınca showScoreBoard() çağrılır.
*/
export const showScoreboardBtn = document.getElementById("showScoreboardBtn");

/* -------------------------------------
   Oyuncu Adı
-------------------------------------- */
export let playerName = localStorage.getItem("playerName") || undefined;

// Eğer isim yoksa index.html'e gidebilir veya uyarı verilir
if (!playerName) {
  window.location.href = "index.html";
}

/* -------------------------------------
   Oyun Değişkenleri
-------------------------------------- */
let gameStarted = false;
let gameOver = false;
let gameStartTime = 0;

let x, y, dx, dy;
let paddleX = 0;
let lastTouchX = null;
const paddleHeight = 10;
const paddleWidth = 75;
const ballRadius = 10;

let rightPressed = false;
let leftPressed = false;

/* -------------------------------------
   Blok Dizilimi ile İlgili DEFAULT Değişkenler
-------------------------------------- */
let brickRowCount = 5;
let brickColumnCount = 7;
let brickWidth = 50;
let brickHeight = 15;
let brickPadding = 10;
let brickOffsetTop = 30;
let brickOffsetLeft = 30;

// levelBricks dizisini her level özelinde doldurulacak. Doldurulmazsa default değerler atanır. Bu değerler de 1. bölümün deeğerleridir.
let levelBricks = []; // Her biri { x, y, status, type } olacak

// Bu “brickTypes” eğer her seviyede aynıysa burada tutlabilir.
// Ancak seviye özelinde de “brickTypes” değişebilir.
// O zaman setLevelConfig ile değişebilir.
let brickTypes = [
  { color: "#e53935", score: 30 },
  { color: "#1e88e5", score: 20 },
  { color: "#9c27b0", score: 10 },
];

/**
    setLevelConfig:
    Her level dosyasından (level1.js vb.)
    Örnek config:
    ```js
    {
        rowCount: 6,
        columnCount: 8,
        brickWidth: 40,
        brickHeight: 15,
        brickOffsetTop: 50,
        // vs...
        bricks: [ {x:..., y:..., status:1, type:...}, ... ],
        // veya bricks initial data
        brickTypes: [ ... ] // eğer farklıysa
    }
    ```
*/
export function setLevelConfig(config) {
  if (config.rowCount) brickRowCount = config.rowCount;
  if (config.columnCount) brickColumnCount = config.columnCount;
  if (config.brickWidth) brickWidth = config.brickWidth;
  if (config.brickHeight) brickHeight = config.brickHeight;
  if (config.brickPadding) brickPadding = config.brickPadding;
  if (config.brickOffsetTop) brickOffsetTop = config.brickOffsetTop;
  if (config.brickOffsetLeft) brickOffsetLeft = config.brickOffsetLeft;

  if (config.brickTypes) {
    brickTypes = config.brickTypes;
  }

  // Dışarıdan gelen “bricks” dizisi varsa direkt kullanılır.
  if (config.bricks) {
    levelBricks = config.bricks;
  } else {
    // Yoksa parametrelere göre default init et.
    levelBricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
      levelBricks[c] = [];
      for (let r = 0; r < brickRowCount; r++) {
        levelBricks[c][r] = {
          x: 0,
          y: 0,
          status: 1,
          type: brickTypes[r % brickTypes.length], // satıra göre tip ata
        };
      }
    }
  }
}

/* -------------------------------------
   Ortak Fonksiyonlar
-------------------------------------- */
export function initGame() {
  // Başlangıç pozisyonları vs.
  x = canvas.width / 2;
  y = canvas.height - 30;
  dx = 2;
  dy = -2;
  paddleX = (canvas.width - paddleWidth) / 2;

  // Tuş event'leri
  document.addEventListener("keydown", keyDownHandler, false);
  document.addEventListener("keyup", keyUpHandler, false);

  document.addEventListener("touchstart", handleTouchStart, { passive: false });
  document.addEventListener("touchmove", handleTouchMove, { passive: false });
  document.addEventListener("touchend", handleTouchEnd, { passive: false });
}

function handleTouchStart(e) {
  if (
    !e.target.closest("#scoreTableContainer") &&
    !e.target.closest("#scoreBoard")
  ) {
    e.preventDefault();
  }
  if (e.touches && e.touches.length > 0) {
    lastTouchX = e.touches[0].clientX;
  }
}

function handleTouchMove(e) {
  if (
    !e.target.closest("#scoreTableContainer") &&
    !e.target.closest("#scoreBoard")
  ) {
    e.preventDefault();
  }
  if (e.touches && e.touches.length > 0 && lastTouchX !== null) {
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - lastTouchX;
    // deltaX kadar paddle’ı kaydır
    paddleX += deltaX;

    // Sınırları kontrol et
    if (paddleX < 0) {
      paddleX = 0;
    } else if (paddleX > canvas.width - paddleWidth) {
      paddleX = canvas.width - paddleWidth;
    }

    // Son konumu güncelle
    lastTouchX = currentX;
  }
}

function handleTouchEnd(e) {
  lastTouchX = null;
}

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
}

/** Oyunu başlatma */
export function startGame() {
  gameOver = false;
  gameStarted = true;
  gameStartTime = Date.now();
  requestAnimationFrame(draw);
}

/** Çizim döngüsü */
function draw() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  drawTimer();
  collisionDetection();

  // Duvar çarpma
  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }
  if (y + dy < ballRadius) {
    dy = -dy;
  } else if (y + dy > canvas.height - ballRadius) {
    // Paddle kontrolü
    if (x > paddleX && x < paddleX + paddleWidth) {
      dy = -dy;
    } else {
      endGame(false);
    }
  }

  // Paddle hareket
  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }

  x += dx;
  y += dy;

  requestAnimationFrame(draw);
}

/** Top çizimi */
export function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffeb3b";
  ctx.fill();
  ctx.closePath();
}

/** Paddle çizimi */
export function drawPaddle() {
  ctx.beginPath();
  ctx.rect(
    paddleX,
    canvas.height - paddleHeight - 10,
    paddleWidth,
    paddleHeight
  );
  ctx.fillStyle = "#00bcd4";
  ctx.fill();
  ctx.closePath();
}

/** Blokları çizimi */
export function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = levelBricks[c][r];
      if (b.status === 1) {
        const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        b.x = brickX;
        b.y = brickY;
        ctx.beginPath();
        ctx.rect(brickX, brickY, brickWidth, brickHeight);
        ctx.fillStyle = b.type.color;
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

/** Çarpışma kontrolü */
function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const b = levelBricks[c][r];
      if (b.status === 1) {
        if (
          x > b.x &&
          x < b.x + brickWidth &&
          y > b.y &&
          y < b.y + brickHeight
        ) {
          dy = -dy;
          b.status = 0;
          score += b.type.score;
          if (checkWin()) {
            endGame(true);
          }
        }
      }
    }
  }
}

/** Kazanma kontrolü */
function checkWin() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (levelBricks[c][r].status === 1) {
        return false;
      }
    }
  }
  return true;
}

/** Skor */
let score = 0;
function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("Skor: " + score, 8, 20);
}

/** Timer */
function drawTimer() {
  if (!gameStarted) return;
  const currentTime = Date.now();
  const elapsed = Math.floor((currentTime - gameStartTime) / 1000);
  ctx.font = "16px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("Süre: " + elapsed + " sn", canvas.width - 100, 20);
}

/** Oyun Bitişi */
export function endGame(won, level = 1) {
  gameOver = true;
  const endTime = Date.now();
  const elapsed = Math.floor((endTime - gameStartTime) / 1000);
  const result = won ? "Kazandınız!" : "Kaybettiniz!";

  // Skoru kaydet
  saveScore({
    name: playerName,
    score: score,
    duration: elapsed,
    level,
  });

  // Skor tablosu göster
  showScoreBoard();

  alert(result + "\nSkorunuz: " + score + "\nSüre: " + elapsed + " saniye");
}

export function renderLegend(brickTypes) {
  // HTML tarafında #legend id'li div'i seçelim
  const legendDiv = document.getElementById("legend");
  if (!legendDiv) {
    console.log("Legend div not found.");
    return;
  } // legendDiv yoksa çık

  // Önceden eklenmiş şeyler varsa temizleyelim
  legendDiv.innerHTML = "";

  // brickTypes'taki her renk + puan için DOM elemanı oluştur
  brickTypes.forEach((type) => {
    // Dış sarmal
    const itemDiv = document.createElement("div");
    itemDiv.className = "legend-item";

    // Renk kutusu
    const colorBox = document.createElement("div");
    colorBox.className = "legend-color-box";
    colorBox.style.backgroundColor = type.color;

    // Puan yazısı
    const textSpan = document.createElement("span");
    textSpan.textContent = `${type.score} puan`;

    // Birleştir
    itemDiv.appendChild(colorBox);
    itemDiv.appendChild(textSpan);

    // Legend'e ekle
    legendDiv.appendChild(itemDiv);
  });
}

/** Restart */
export function restartGame() {
  scoreBoard.classList.remove("active");

  // Tüm değişkenleri resetle
  score = 0;
  x = canvas.width / 2;
  y = canvas.height - 30;
  dx = 2;
  dy = -2;
  paddleX = (canvas.width - paddleWidth) / 2;

  // Blokları da yeniden init edebilirsiniz (level’e özel)
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (levelBricks[c][r]) {
        levelBricks[c][r].status = 1;
      }
    }
  }

  gameOver = false;
  startGame();
}

/** Skor Tablosu (Firestore’dan) */
export async function showScoreBoard() {
  const scores = await getScores();
  scoreTableBody.innerHTML = "";

  scores.forEach((item) => {
    const tr = document.createElement("tr");
    const tdName = document.createElement("td");
    const tdScore = document.createElement("td");
    const tdDuration = document.createElement("td");
    const tdLevel = document.createElement("td");
    const tdTime = document.createElement("td");

    tdName.textContent = item.name;
    tdScore.textContent = item.score;
    tdDuration.textContent = item.duration + " sn";
    tdLevel.textContent = item.level;
    if (item.time && item.time.toDate) {
      tdTime.textContent = item.time.toDate().toLocaleString("tr-TR");
    } else {
      tdTime.textContent = "-";
    }

    tr.appendChild(tdName);
    tr.appendChild(tdScore);
    tr.appendChild(tdDuration);
    tr.appendChild(tdLevel);
    tr.appendChild(tdTime);
    scoreTableBody.appendChild(tr);
  });

  scoreBoard.classList.add("active");
}

/** Ana sayfaya dönme*/
export function goHome() {
  window.location.href = "index.html";
}

window.restartGame = restartGame;
window.goHome = goHome;
