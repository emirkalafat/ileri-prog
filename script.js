//TODO: yeni bölümler eklenecek.
//TODO: Grafikler güzelleştirilecek.
//TODO: Scoreboard eklenecek. (belki global firebase destekli)

// Bu dosyanın başına Firebase importlarını ekliyoruz.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  orderBy,
  query,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Firebase konfigürasyonunuz
const firebaseConfig = {
  apiKey: "AIzaSyDWNKXfLPcxEzOMiFZpcFAJJ_4WPo4YHNs",
  authDomain: "eklft-brick-game.firebaseapp.com",
  projectId: "eklft-brick-game",
  storageBucket: "eklft-brick-game.firebasestorage.app",
  messagingSenderId: "600145370635",
  appId: "1:600145370635:web:a22d7e06b599ad6ee2310e",
  measurementId: "G-MD4B8R5ZWW",
};

// Firebase'i başlatıyoruz
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Başlangıç Ekranı Elemanları
const startScreen = document.getElementById("startScreen");
const playerNameInput = document.getElementById("playerNameInput");
const startBtn = document.getElementById("startBtn");

// Skor Tablosu Elemanları
const scoreBoard = document.getElementById("scoreBoard");
const scoreTableBody = document.getElementById("scoreTableBody");

let playerName = "";
let gameStarted = false;
let gameStartTime = 0;
let gameOver = false;

// Oyun Değişkenleri
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;
const ballRadius = 10;

const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

let rightPressed = false;
let leftPressed = false;

// Blok Ayarları
const brickRowCount = 5;
const brickColumnCount = 7;
const brickWidth = 50;
const brickHeight = 15;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

// Farklı tipte bloklar (renk ve puan)
// Burada basitçe satır sayısına göre blok tipi verelim (örn: üst satırlar daha çok puan)
// Ya da karma random atayabiliriz. Burada sabit bir atama yapalım:
// 0. satır: kırmızı, 30 puan
// 1. satır: mavi, 20 puan
// 2. satır: mor, 10 puan
// 3. satır: mavi, 20 puan
// 4. satır: mor, 10 puan
const brickTypes = [
  { color: "#e53935", score: 30 },
  { color: "#1e88e5", score: 20 },
  { color: "#9c27b0", score: 10 },
  { color: "#1e88e5", score: 20 },
  { color: "#9c27b0", score: 10 },
];

let bricks = [];
let score = 0;

function initBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1, type: brickTypes[r] };
    }
  }
}
initBricks();

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

startBtn.addEventListener("click", () => {
  playerName = playerNameInput.value.trim();
  if (playerName === "") {
    alert("Lütfen bir isim girin.");
    return;
  }
  startScreen.classList.remove("active");
  startGame();
});

function startGame() {
  gameStarted = true;
  gameStartTime = Date.now();
  draw();
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

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let b = bricks[c][r];
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

function checkWin() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status === 1) {
        return false;
      }
    }
  }
  return true;
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffeb3b";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
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

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let b = bricks[c][r];
      if (b.status === 1) {
        let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
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

function drawScore() {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("Skor: " + score, 8, 20);
}

function drawTimer() {
  if (!gameStarted) return;
  const currentTime = Date.now();
  const elapsed = Math.floor((currentTime - gameStartTime) / 1000);
  ctx.font = "16px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText("Süre: " + elapsed + " sn", canvas.width - 100, 20);
}

function draw() {
  if (gameOver) return; // Oyun bitti ise çizme

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddle();
  drawScore();
  drawTimer();
  collisionDetection();

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

  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }

  x += dx;
  y += dy;
  requestAnimationFrame(draw);
}

function endGame(won) {
  gameOver = true;
  const endTime = Date.now();
  const elapsed = Math.floor((endTime - gameStartTime) / 1000);
  const result = won ? "Kazandınız!" : "Kaybettiniz!";

  // Skoru kaydet
  saveScore(playerName, score, elapsed);

  // Skor Tablosunu Göster
  showScoreBoard();
  alert(result + "\nSkorunuz: " + score + "\nSüre: " + elapsed + " saniye");
}

async function saveScore(name, scoreVal, durationVal) {
  await addDoc(collection(db, "scoreboard"), {
    name: name,
    score: scoreVal,
    duration: durationVal,
    //TODO: buraya yükleme zamanı eklenecek
  });
}

async function showScoreBoard() {
  // Skorları çek
  // Burada skorları azalan sırada sıralamak için "orderBy" kullanacağız.
  // Ancak Firestore orderBy için bir alan gerekiyor.
  // Sıralamayı skor'a göre azalan yapacaksanız:
  // Firestore sorgusu: query(collection(db, "scoreboard"), orderBy("score", "desc"))
  const q = query(collection(db, "scoreboard"), orderBy("score", "desc"));
  const querySnapshot = await getDocs(q);

  scoreTableBody.innerHTML = "";
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const tr = document.createElement("tr");
    const tdName = document.createElement("td");
    const tdScore = document.createElement("td");
    const tdDuration = document.createElement("td");
    const tdTime = document.createElement("td");

    tdName.textContent = data.name;
    tdScore.textContent = data.score;
    tdDuration.textContent = data.duration + " sn";
    tdTime.textContent = data.time.toDate().toLocale();

    tr.appendChild(tdName);
    tr.appendChild(tdScore);
    tr.appendChild(tdDuration);
    tr.appendChild(tdTime);
    scoreTableBody.appendChild(tr);
  });

  scoreBoard.classList.add("active");
}

function restartGame() {
  scoreBoard.classList.remove("active");
  resetGame();
  startScreen.classList.add("active");
}

function resetGame() {
  playerName = "";
  score = 0;
  x = canvas.width / 2;
  y = canvas.height - 30;
  dx = 2;
  dy = -2;
  paddleX = (canvas.width - paddleWidth) / 2;
  initBricks();
  gameOver = false;
}
