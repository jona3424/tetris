const tetrisGrid = document.querySelector('.tetris-grid');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');
const linesDisplay = document.getElementById('lines');

const startScreen = document.getElementById('start-screen');
const instructionsScreen = document.getElementById('instructions-screen');
const highScoresScreen = document.getElementById('highscores-screen');
const gameScreen = document.getElementById('game-screen');
const endGameOptions = document.querySelector('.end-game-options');

const blockTypesSelect = document.querySelectorAll('.dropdown-content input[type="checkbox"]');
const difficultySelect = document.getElementById('difficulty');
const nextBlockGrid = document.querySelector('.next-block-grid');


const ROWS = 20;
const COLUMNS = 10;
const BLOCK_SIZE = 20;
const BLOCK_PREVIEW_SIZE = 20; // Adjust as needed

let score = 0;
let level =  1;
let lines = 0;
let gameOverFlag = false;
let gameSpeed = 1000;
let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

const allShapes = {
    I: [[1, 1, 1, 1]], 
    O: [[1, 1], [1, 1]], 
    T: [[1, 1, 1], [0, 1, 0]], 
    Z: [[1, 1, 0], [0, 1, 1]], 
    S: [[0, 1, 1], [1, 1, 0]], 
    J: [[1, 1, 1], [1, 0, 0]], 
    L: [[1, 1, 1], [0, 0, 1]] 
};

let selectedShapes = Object.keys(allShapes);
let shapes = selectedShapes.map(key => allShapes[key]);

let grid = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));

function createBlock() {
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    return {
        shape,
        row: 0,
        col: Math.floor(COLUMNS / 2) - Math.floor(shape[0].length / 2)
    };
}

let currentBlock = createBlock();
let nextBlock = createBlock();

function drawNextBlock() {
    nextBlockGrid.innerHTML = '';

    nextBlock.shape.forEach((row, i) => {
        row.forEach((cell, j) => {
            if (cell) {
                block = document.createElement('div');
                block.classList.add('block');
                block.style.width = `${BLOCK_PREVIEW_SIZE}px`;
                block.style.height = `${BLOCK_PREVIEW_SIZE}px`;
                block.style.backgroundColor = 'green';
                block.style.gridRowStart = i+1;
                block.style.gridColumnStart = j+1;
                nextBlockGrid.appendChild(block);
            }
        });
    });

}


function draw() {
    tetrisGrid.innerHTML = '';
    grid.forEach((row) => {
        row.forEach((cell) => {
            const div = document.createElement('div');
            div.style.width = `${BLOCK_SIZE}px`;
            div.style.height = `${BLOCK_SIZE}px`;
            div.style.backgroundColor = cell ? 'blue' : 'black';
            tetrisGrid.appendChild(div);
        });
    });

    currentBlock.shape.forEach((row, i) => {
        row.forEach((cell, j) => {
            if (cell) {
                const block = document.createElement('div');
                block.classList.add('block');
                block.style.width = `${BLOCK_SIZE}px`;
                block.style.height = `${BLOCK_SIZE}px`;
                block.style.backgroundColor = 'red';
                block.style.top = `${(currentBlock.row + i) * BLOCK_SIZE}px`;
                block.style.left = `${(currentBlock.col + j) * BLOCK_SIZE}px`;
                tetrisGrid.appendChild(block);
            }
        });
    });
}

function moveBlock(dx, dy) {
    currentBlock.row += dy;
    currentBlock.col += dx;
    if (checkCollision()) {
        currentBlock.row -= dy;
        currentBlock.col -= dx;
        if (dy === 1) {
            placeBlock();
            clearLines();
            if (checkCollision()) {
                gameOverFlag = true;
                saveHighScore();
                showEndGameOptions();
            }
        }
    }
    draw();
}

function checkCollision() {
    return currentBlock.shape.some((row, i) => {
        return row.some((cell, j) => {
            if (cell) {
                const newRow = currentBlock.row + i;
                const newCol = currentBlock.col + j;
                return newRow >= ROWS || newCol < 0 || newCol >= COLUMNS || grid[newRow][newCol];
            }
            return false;
        });
    });
}

function placeBlock() {
    currentBlock.shape.forEach((row, i) => {
        row.forEach((cell, j) => {
            if (cell) {
                grid[currentBlock.row + i][currentBlock.col + j] = 1;
            }
        });
    });
    currentBlock = nextBlock;
    nextBlock = createBlock();
    drawNextBlock();
}

function clearLines() {
    grid = grid.filter(row => row.some(cell => !cell));
    const clearedLines = ROWS - grid.length;
    lines += clearedLines;
    score += clearedLines * 10;
    grid.unshift(...Array.from({ length: clearedLines }, () => Array(COLUMNS).fill(0)));
    updateScore();
}

function updateScore() {
    scoreDisplay.textContent = score;
    levelDisplay.textContent = difficultySelect.value === 'easy' ? 1 : difficultySelect.value === 'medium' ? 2 : 3;
    linesDisplay.textContent = lines;
}

document.addEventListener('keydown', (e) => {
    if (gameOverFlag) return;
    if (e.key === 'ArrowLeft' || e.key==='a' || e.key==='A' ) {
        moveBlock(-1, 0);
    } else if (e.key === 'ArrowRight' || e.key==='d' || e.key==='D') {
        moveBlock(1, 0);
    } else if (e.key === 'ArrowDown' || e.key==='s' || e.key==='S') {
        moveBlock(0, 1);
    } else if (e.key === 'ArrowUp'  || e.key==='w' || e.key==='W') {
        rotateBlock();
    }
});

function rotateBlock() {
    const previousShape = currentBlock.shape;
    currentBlock.shape = currentBlock.shape[0].map((val, index) =>
        currentBlock.shape.map(row => row[index]).reverse()
    );
    if (checkCollision()) {
        currentBlock.shape = previousShape;
    }
    draw();
}

function gameLoop() {
    if (gameOverFlag) return;
    moveBlock(0, 1);
    setTimeout(gameLoop, gameSpeed);
}

function speedUp() {
    gameSpeed = Math.max(100, gameSpeed - 50);
}

function saveHighScore() {
    const name = prompt("Write ur name:");
    const highScore = { name, score };
    highScores.push(highScore);
    highScores.sort((a, b) => b.score - a.score);
    highScores = highScores.slice(0, 5);
    localStorage.setItem('highScores', JSON.stringify(highScores));
}

function showHighScores() {
    hideAllScreens();
    highScoresScreen.style.display = 'flex';
    const highScoresList = document.getElementById('highscores-list');
    highScoresList.innerHTML = highScores.map(score => `<li>${score.name}: ${score.score}</li>`).join('');
}

function showInstructions() {
    hideAllScreens();
    instructionsScreen.style.display = 'flex';
}

function showStartScreen() {
    hideAllScreens();
    startScreen.style.display = 'flex';
}

function startGame() {
    hideAllScreens();
    gameScreen.style.display = 'flex';
    endGameOptions.style.display = 'none';
    selectedShapes = Array.from(blockTypesSelect).filter(input => input.checked).map(input => input.value);
    shapes = selectedShapes.map(key => allShapes[key]);
    const difficulty = difficultySelect.value;
    levelDisplay.textContent = difficultySelect.value=== 'easy' ? 1 : difficultySelect.value === 'medium' ? 2 : 3;
    gameSpeed = difficulty === 'easy' ? 1000 : difficulty === 'medium' ? 700 : 400;

    resetGame();
    drawNextBlock();

    draw();
    gameLoop();
    setInterval(speedUp, 10000);
}

function showEndGameOptions() {
    endGameOptions.style.display = 'flex';
}

function resetGame() {
    score = 0;
    level = 1;
    lines = 0;
    gameOverFlag = false;
    grid = Array.from({ length: ROWS }, () => Array(COLUMNS).fill(0));
    currentBlock = createBlock();
    updateScore();
}

function hideAllScreens() {
    startScreen.style.display = 'none';
    instructionsScreen.style.display = 'none';
    highScoresScreen.style.display = 'none';
    gameScreen.style.display = 'none';
}

showStartScreen();
