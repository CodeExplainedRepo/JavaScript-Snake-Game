// select elements
const scoreEl = document.querySelector('.score');
const highScoreEl = document.querySelector('.high-score');
const gameOverEl = document.querySelector('.game-over');
const playAgainBtn = document.querySelector('.play-again');

// select cvs
const cvs = document.getElementById('cvs');
const ctx = cvs.getContext('2d');

// add border to cvs element
cvs.style.border = '1px solid #FFF';

// dimensions
const width = cvs.width,
  height = cvs.height;

// Square
const squareSize = 20;
const horizontalSq = width / squareSize;
const verticalSq = height / squareSize;

// game colors
const headColor = '#FFF',
  bodyColor = '#999',
  boardColor = '#000',
  foodColor = '#F95700FF';

// game
let FPS = 1000 / 15;
let gameLoop;
let gameStarted = false;

// current direction
let directionsQueue = [];
let currentDirection = '';
const direction = {
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
  UP: 'ArrowUp',
  DOWN: 'ArrowDown',
};

// listen to user's key up
document.addEventListener('keyup', setDirection);
function setDirection(e) {
  const newDirection = e.key;
  const oldDirection = currentDirection;

  if (
    (newDirection === direction.LEFT &&
      oldDirection !== direction.RIGHT) ||
    (newDirection === direction.RIGHT &&
      oldDirection !== direction.LEFT) ||
    (newDirection === direction.UP &&
      oldDirection !== direction.DOWN) ||
    (newDirection === direction.DOWN && oldDirection !== direction.UP)
  ) {
    if (!gameStarted) {
      gameLoop = setInterval(frame, FPS);
      gameStarted = true;
    }
    directionsQueue.push(newDirection);
  }
}

// snake
let snake = [
  { x: 2, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: 0 },
];
function drawSnake() {
  snake.forEach((tile, i) => {
    const color = i === 0 ? headColor : bodyColor;
    drawSquare(tile.x, tile.y, color);
  });
}
function moveSnake() {
  // check if game not yet started
  if (!gameStarted) return;

  const head = { ...snake[0] };

  if (directionsQueue.length) {
    currentDirection = directionsQueue.shift();
  }

  switch (currentDirection) {
    case direction.LEFT:
      head.x -= 1;
      break;
    case direction.RIGHT:
      head.x += 1;
      break;
    case direction.UP:
      head.y -= 1;
      break;
    case direction.DOWN:
      head.y += 1;
      break;
  }

  if (hasEatenFood()) {
    food = createFood();
  } else {
    snake.pop();
  }

  snake.unshift(head);
}
function hasEatenFood() {
  const head = snake[0];
  return food.x === head.x && food.y === head.y;
}
function hitWall() {
  const head = snake[0];
  return (
    head.x >= horizontalSq ||
    head.x < 0 ||
    head.y >= verticalSq ||
    head.y < 0
  );
}
function hitSelf() {
  const snakeBody = [...snake];
  const head = snakeBody.shift();

  return snakeBody.some(
    (tile) => tile.x === head.x && tile.y === head.y
  );
}

// score
const initialSnakeLength = snake.length;
let score = 0;
let highScore = localStorage.getItem('high-score') || 0;

function renderScore() {
  score = snake.length - initialSnakeLength;
  scoreEl.innerHTML = `⭐ ${score}`;
  highScoreEl.innerHTML = `🏆 ${highScore}`;
}

// food
let food = createFood();
function createFood() {
  let food = {
    x: Math.floor(Math.random() * horizontalSq),
    y: Math.floor(Math.random() * verticalSq),
  };

  while (
    snake.some((tile) => tile.x === food.x && tile.y === food.y)
  ) {
    food = {
      x: Math.floor(Math.random() * horizontalSq),
      y: Math.floor(Math.random() * verticalSq),
    };
  }

  return food;
}
function drawFood() {
  drawSquare(food.x, food.y, foodColor);
}

// draw square
function drawSquare(x, y, color) {
  const sq = squareSize;

  ctx.fillStyle = color;
  ctx.fillRect(x * sq, y * sq, sq, sq);

  ctx.strokeStyle = boardColor;
  ctx.strokeRect(x * sq, y * sq, sq, sq);
}

// draw board
function drawBoard() {
  ctx.fillStyle = boardColor;
  ctx.fillRect(0, 0, width, height);
}

// game loop
function frame() {
  // draw board
  drawBoard();

  // draw food
  drawFood();

  // move Snake
  moveSnake();

  // draw snake
  drawSnake();

  // render score
  renderScore();

  // check for game over
  if (hitWall() || hitSelf()) {
    clearInterval(gameLoop);
    gameOver();
  }
}
frame();

// GAME OVER
function gameOver() {
  // select elements
  const scoreEl = gameOverEl.querySelector(
    '.game-over-score .current'
  );
  const highScoreEl = gameOverEl.querySelector(
    '.game-over-score .high'
  );

  // update score
  scoreEl.innerHTML = `⭐ ${score}`;

  // update high score
  highScore = Math.max(highScore, score);
  localStorage.setItem('high-score', highScore);
  highScoreEl.innerHTML = `🏆 ${highScore}`;

  // show game over screen
  gameOverEl.classList.remove('hide');
}

// restart game
playAgainBtn.addEventListener('click', restartGame);
function restartGame() {
  // reset direction to no direction
  currentDirection = '';

  // clear the directions queue
  directionsQueue = [];

  // reset the snake size and position
  snake = [
    { x: 2, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 0 },
  ];

  // hide game over screen
  gameOverEl.classList.add('hide');

  // gameStarted
  gameStarted = false;

  // restart game
  frame();
}
