let canvas = document.querySelector("#tetris");
let scoreboard = document.querySelector("h2");
let ctx = canvas.getContext("2d");
ctx.scale(30, 30);

// Получаем значения CSS-переменных
const rootStyle = getComputedStyle(document.documentElement);
const BLOCK_COLOR = rootStyle.getPropertyValue('--tg-theme-accent-text-color').trim();
const BORDER_COLOR = rootStyle.getPropertyValue('--tg-theme-text-color').trim();
const BG_COLOR = rootStyle.getPropertyValue('--tg-theme-bg-color').trim();

const SHAPES = [
    { shape: [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]
    ], opacity: 0.7 },
    { shape: [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0]
    ], opacity: 0.8 },
    { shape: [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1]
    ], opacity: 0.9 },
    { shape: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ], opacity: 0.6 },
    { shape: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ], opacity: 0.7 },
    { shape: [
        [1, 1, 1],
        [0, 1, 0],
        [0, 0, 0]
    ], opacity: 0.8 },
    { shape: [
        [1, 1],
        [1, 1],
    ], opacity: 0.9 }
];

const COLORS = [
    "#fff", // фон
    BLOCK_COLOR // цвет блоков
];

const ROWS = 20;
const COLS = 10;

let grid = generateGrid();
let fallingPieceObj = null;
let score = 0;
let bestScore = localStorage.getItem('bestScore') ? parseInt(localStorage.getItem('bestScore')) : 0;

setInterval(newGameState, 500);

function newGameState() {
    checkGrid();
    if (!fallingPieceObj) {
        fallingPieceObj = randomPieceObject();
        renderPiece();
    }
    moveDown();
}

function checkGrid() {
    let count = 0;
    for (let i = 0; i < grid.length; i++) {
        let allFilled = true;
        for (let j = 0; j < grid[0].length; j++) {
            if (grid[i][j] == 0) {
                allFilled = false;
            }
        }
        if (allFilled) {
            count++;
            grid.splice(i, 1);
            grid.unshift(new Array(COLS).fill(0));
        }
    }
    if (count == 1) {
        score += 10;
    } else if (count == 2) {
        score += 30;
    } else if (count == 3) {
        score += 50;
    } else if (count > 3) {
        score += 100;
    }

    // Обновляем лучший результат
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('bestScore', bestScore);
    }

    scoreboard.innerHTML = `Score: ${score} | Best Score: ${bestScore}`;
}

function generateGrid() {
    let grid = [];
    for (let i = 0; i < ROWS; i++) {
        grid.push(new Array(COLS).fill(0));
    }
    return grid;
}

function randomPieceObject() {
    let ran = Math.floor(Math.random() * SHAPES.length);
    let piece = SHAPES[ran].shape;
    let opacity = SHAPES[ran].opacity; // Используйте прозрачность из массива
    let colorIndex = 1; // Use the same color for all pieces
    let x = 4;
    let y = 0;
    return { piece, colorIndex, x, y, opacity };
}

function renderPiece() {
    if (fallingPieceObj) {
        let piece = fallingPieceObj.piece;
        ctx.globalAlpha = fallingPieceObj.opacity; // Используйте заданную прозрачность
        for (let i = 0; i < piece.length; i++) {
            for (let j = 0; j < piece[i].length; j++) {
                if (piece[i][j] == 1) {
                    ctx.fillStyle = COLORS[fallingPieceObj.colorIndex];
                    ctx.fillRect(fallingPieceObj.x + j, fallingPieceObj.y + i, 1, 1);
                    ctx.strokeStyle = BORDER_COLOR;
                    ctx.lineWidth = 1 / 30; // Adjust for scaled context
                    ctx.strokeRect(fallingPieceObj.x + j, fallingPieceObj.y + i, 1, 1);
                }
            }
        }
        ctx.globalAlpha = 1.0; // Reset globalAlpha after drawing the piece
    }
}

function moveDown() {
    if (!collision(fallingPieceObj.x, fallingPieceObj.y + 1)) {
        fallingPieceObj.y += 1;
    } else {
        let piece = fallingPieceObj.piece;
        for (let i = 0; i < piece.length; i++) {
            for (let j = 0; j < piece[i].length; j++) {
                if (piece[i][j] == 1) {
                    let p = fallingPieceObj.x + j;
                    let q = fallingPieceObj.y + i;
                    grid[q][p] = fallingPieceObj.colorIndex;
                }
            }
        }
        if (fallingPieceObj.y == 0) {
            if (score > bestScore) {
                bestScore = score;
                localStorage.setItem('bestScore', bestScore);
            }
            alert("Game over");
            grid = generateGrid();
            score = 0;
        }
        fallingPieceObj = null;
    }
    renderGame();
}

function moveLeft() {
    if (!collision(fallingPieceObj.x - 1, fallingPieceObj.y)) {
        fallingPieceObj.x -= 1;
    }
    renderGame();
}

function moveRight() {
    if (!collision(fallingPieceObj.x + 1, fallingPieceObj.y)) {
        fallingPieceObj.x += 1;
    }
    renderGame();
}

function rotate() {
    let rotatedPiece = [];
    let piece = fallingPieceObj.piece;
    for (let i = 0; i < piece.length; i++) {
        rotatedPiece.push(new Array(piece[i].length).fill(0));
    }
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            rotatedPiece[i][j] = piece[j][i];
        }
    }
    for (let i = 0; i < rotatedPiece.length; i++) {
        rotatedPiece[i] = rotatedPiece[i].reverse();
    }
    if (!collision(fallingPieceObj.x, fallingPieceObj.y, rotatedPiece)) {
        fallingPieceObj.piece = rotatedPiece;
    }
    renderGame();
}

function collision(x, y, rotatedPiece) {
    let piece = rotatedPiece || fallingPieceObj.piece;
    for (let i = 0; i < piece.length; i++) {
        for (let j = 0; j < piece[i].length; j++) {
            if (piece[i][j] == 1) {
                let p = x + j;
                let q = y + i;
                if (p >= 0 && p < COLS && q >= 0 && q < ROWS) {
                    if (grid[q][p] > 0) {
                        return true;
                    }
                } else {
                    return true;
                }
            }
        }
    }
    return false;
}

function renderGame() {
    // Очистить весь канвас
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Установить цвет фона и заполнить его
    ctx.fillStyle = BG_COLOR; // Используем переменную BG_COLOR для фона
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Отрисовать сетку и фиксированные блоки
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            let cell = grid[i][j];
            if (cell > 0) {
                ctx.globalAlpha = 0.8; // Задаем прозрачность для фиксированных блоков
                ctx.fillStyle = COLORS[cell];
                ctx.fillRect(j, i, 1, 1);
                ctx.strokeStyle = BORDER_COLOR;
                ctx.lineWidth = 1 / 30; // Adjust for scaled context
                ctx.strokeRect(j, i, 1, 1);
            }
        }
    }

    // Reset globalAlpha to default
    ctx.globalAlpha = 1.0;

    // Отрисовать текущий падающий блок
    if (fallingPieceObj) {
        renderPiece();
    }
}

// Continuous movement logic
let leftInterval, rightInterval, downInterval;

function startMoveLeft() {
    moveLeft();
    leftInterval = setInterval(moveLeft, 200); // Adjust the interval time as needed
}

function startMoveRight() {
    moveRight();
    rightInterval = setInterval(moveRight, 200); // Adjust the interval time as needed
}

function startMoveDown() {
    moveDown();
    downInterval = setInterval(moveDown, 200); // Adjust the interval time as needed
}

function stopMoveLeft() {
    clearInterval(leftInterval);
}

function stopMoveRight() {
    clearInterval(rightInterval);
}

function stopMoveDown() {
    clearInterval(downInterval);
}

// Обработчики для кнопок
document.getElementById('downButton').addEventListener('mousedown', startMoveDown);
document.getElementById('leftButton').addEventListener('mousedown', startMoveLeft);
document.getElementById('rightButton').addEventListener('mousedown', startMoveRight);

document.getElementById('downButton').addEventListener('mouseup', stopMoveDown);
document.getElementById('leftButton').addEventListener('mouseup', stopMoveLeft);
document.getElementById('rightButton').addEventListener('mouseup', stopMoveRight);

document.getElementById('downButton').addEventListener('mouseleave', stopMoveDown);
document.getElementById('leftButton').addEventListener('mouseleave', stopMoveLeft);
document.getElementById('rightButton').addEventListener('mouseleave', stopMoveRight);

// Поддержка для мобильных устройств
document.getElementById('downButton').addEventListener('touchstart', function (e) {
    e.preventDefault(); // Предотвращаем нежелательные действия
    startMoveDown();
});

document.getElementById('leftButton').addEventListener('touchstart', function (e) {
    e.preventDefault(); // Предотвращаем нежелательные действия
    startMoveLeft();
});

document.getElementById('rightButton').addEventListener('touchstart', function (e) {
    e.preventDefault(); // Предотвращаем нежелательные действия
    startMoveRight();
});

document.getElementById('downButton').addEventListener('touchend', stopMoveDown);
document.getElementById('leftButton').addEventListener('touchend', stopMoveLeft);
document.getElementById('rightButton').addEventListener('touchend', stopMoveRight);

// Обычные обработчики для кнопки поворота
document.getElementById('rotateButton').addEventListener('mousedown', rotate);
document.getElementById('rotateButton').addEventListener('touchstart', function (e) {
    e.preventDefault(); // Предотвращаем нежелательные действия
    rotate();
});
