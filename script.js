const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const startButton = document.getElementById('start-button');
const pauseButton = document.getElementById('pause-button');
const leftButton = document.getElementById('left-button');
const rightButton = document.getElementById('right-button');
const rotateButton = document.getElementById('rotate-button');
const downButton = document.getElementById('down-button');

const ROW = 20;
const COL = 10;
const SQ = 20; // 1マスのサイズ
const VACANT = "#fff0f5"; // 空白マスの色

// グリッドを描画する
function drawSquare(x, y, color) {
    context.fillStyle = color;
    context.fillRect(x * SQ, y * SQ, SQ, SQ);

    context.strokeStyle = "#ccc";
    context.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

// ゲームボードを作成
let board = [];
for (let r = 0; r < ROW; r++) {
    board[r] = [];
    for (let c = 0; c < COL; c++) {
        board[r][c] = VACANT;
    }
}

// ゲームボードを描画
function drawBoard() {
    for (let r = 0; r < ROW; r++) {
        for (let c = 0; c < COL; c++) {
            drawSquare(c, r, board[r][c]);
        }
    }
}

drawBoard();

// テトリミノの形
const Z = [
    [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
    [[0, 0, 1], [0, 1, 1], [0, 1, 0]]
];

const S = [
    [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 1], [0, 0, 1]]
];

const T = [
    [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
    [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
    [[0, 1, 0], [1, 1, 0], [0, 1, 0]]
];

const O = [
    [[1, 1], [1, 1]]
];

const L = [
    [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
    [[0, 0, 0], [1, 1, 1], [1, 0, 0]],
    [[1, 1, 0], [0, 1, 0], [0, 1, 0]]
];

const I = [
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]]
];

const J = [
    [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 1], [0, 1, 0], [0, 1, 0]],
    [[0, 0, 0], [1, 1, 1], [0, 0, 1]],
    [[0, 1, 0], [0, 1, 0], [1, 1, 0]]
];

// テトリミノ（ブロック）
const PIECES = [
    [Z, "red"],
    [S, "green"],
    [T, "yellow"],
    [O, "blue"],
    [L, "purple"],
    [I, "cyan"],
    [J, "orange"]
];

// newPieceで新しいピースを生成する
function Piece(tetromino, color) {
    this.tetromino = tetromino;
    this.color = color;

    this.tetrominoN = 0; // テトリミノの回転状態
    this.activeTetromino = this.tetromino[this.tetrominoN];

    // テトリミノの初期位置
    this.x = 3;
    this.y = -2;
}

// ピースの描画・削除
Piece.prototype.fill = function(color) {
    for (let r = 0; r < this.activeTetromino.length; r++) {
        for (let c = 0; c < this.activeTetromino.length; c++) {
            if (this.activeTetromino[r][c]) {
                drawSquare(this.x + c, this.y + r, color);
            }
        }
    }
}

Piece.prototype.draw = function() {
    this.fill(this.color);
}

Piece.prototype.unDraw = function() {
    this.fill(VACANT);
}

// ピースを下に移動させる
Piece.prototype.moveDown = function() {
    if (!this.collision(0, 1, this.activeTetromino)) {
        this.unDraw();
        this.y++;
        this.draw();
    } else {
        this.lock();
        p = randomPiece();
    }
}

// ピースを右に移動させる
Piece.prototype.moveRight = function() {
    if (!this.collision(1, 0, this.activeTetromino)) {
        this.unDraw();
        this.x++;
        this.draw();
    }
}

// ピースを左に移動させる
Piece.prototype.moveLeft = function() {
    if (!this.collision(-1, 0, this.activeTetromino)) {
        this.unDraw();
        this.x--;
        this.draw();
    }
}

// ピースを回転させる
Piece.prototype.rotate = function() {
    let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
    let kick = 0;

    if (this.collision(0, 0, nextPattern)) {
        if (this.x > COL / 2) {
            // 右の壁
            kick = -1;
        } else {
            // 左の壁
            kick = 1;
        }
    }

    if (!this.collision(kick, 0, nextPattern)) {
        this.unDraw();
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length;
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
    }
}

let score = 0;

Piece.prototype.lock = function() {
    for (let r = 0; r < this.activeTetromino.length; r++) {
        for (let c = 0; c < this.activeTetromino.length; c++) {
            if (!this.activeTetromino[r][c]) {
                continue;
            }
            if (this.y + r < 0) {
                alert("ゲームオーバー");
                gameOver = true;
                break;
            }
            board[this.y + r][this.x + c] = this.color;
        }
    }

    let rowsToRemove = [];
    for (let r = 0; r < ROW; r++) {
        let isRowFull = true;
        for (let c = 0; c < COL; c++) {
            isRowFull = isRowFull && (board[r][c] != VACANT);
        }
        if (isRowFull) {
            rowsToRemove.push(r);
        }
    }

    if (rowsToRemove.length > 0) {
        isAnimating = true;
        let blinkCount = 0;
        const blinkInterval = setInterval(() => {
            rowsToRemove.forEach(r => {
                for (let c = 0; c < COL; c++) {
                    board[r][c] = (blinkCount % 2 === 0) ? "#ffd700" : VACANT; // キラキラの色
                }
            });
            drawBoard();
            blinkCount++;
            if (blinkCount >= 4) { // 点滅回数
                clearInterval(blinkInterval);
                rowsToRemove.forEach(r => {
                    for (let y = r; y > 1; y--) {
                        for (let c = 0; c < COL; c++) {
                            board[y][c] = board[y - 1][c];
                        }
                    }
                    for (let c = 0; c < COL; c++) {
                        board[0][c] = VACANT;
                    }
                });
                score += rowsToRemove.length * 10;
                drawBoard();
                scoreElement.innerHTML = score;
                isAnimating = false;
            }
        }, 150); // 点滅速度
    }

    drawBoard();
    scoreElement.innerHTML = score;
}

// 衝突検知
Piece.prototype.collision = function(x, y, piece) {
    for (let r = 0; r < piece.length; r++) {
        for (let c = 0; c < piece.length; c++) {
            if (!piece[r][c]) {
                continue;
            }
            let newX = this.x + c + x;
            let newY = this.y + r + y;

            if (newX < 0 || newX >= COL || newY >= ROW) {
                return true;
            }
            if (newY < 0) {
                continue;
            }
            if (board[newY][newX] != VACANT) {
                return true;
            }
        }
    }
    return false;
}

// キーボード操作
document.addEventListener("keydown", CONTROL);

function CONTROL(event) {
    if (event.keyCode == 37) {
        p.moveLeft();
    } else if (event.keyCode == 38) {
        p.rotate();
    } else if (event.keyCode == 39) {
        p.moveRight();
    } else if (event.keyCode == 40) {
        p.moveDown();
    }
}

// ボタン操作
leftButton.addEventListener('click', () => p.moveLeft());
rightButton.addEventListener('click', () => p.moveRight());
rotateButton.addEventListener('click', () => p.rotate());
downButton.addEventListener('click', () => p.moveDown());

// 新しいピースをランダムに生成
function randomPiece() {
    let r = Math.floor(Math.random() * PIECES.length)
    return new Piece(PIECES[r][0], PIECES[r][1]);
}

let p = randomPiece();

let gameOver = false;
let interval;
let paused = false; // 一時停止の状態を管理
let isAnimating = false; // アニメーション中のフラグ

startButton.addEventListener('click', () => {
    if (startButton.innerText === 'スタート') {
        startButton.innerText = 'リセット';
        drop();
    } else {
        // リセット処理
        clearInterval(interval);
        // ボードをクリア
        for (let r = 0; r < ROW; r++) {
            for (let c = 0; c < COL; c++) {
                board[r][c] = VACANT;
            }
        }
        drawBoard();
        score = 0;
        scoreElement.innerHTML = score;
        p = randomPiece();
        gameOver = false;
        startButton.innerText = 'スタート';
    }
});

function drop() {
    interval = setInterval(() => {
        if (!gameOver && !paused && !isAnimating) { // アニメーション中でない場合のみ落下
            p.moveDown();
        } else if (gameOver) {
            clearInterval(interval);
        }
    }, 1000);
}

pauseButton.addEventListener('click', () => {
    if (paused) {
        paused = false;
        pauseButton.innerText = '一時停止';
    } else {
        paused = true;
        pauseButton.innerText = '再開';
    }
});