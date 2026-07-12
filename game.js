const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const CELL_SIZE = 10;
const COLS = 80;
const ROWS = 50;

canvas.width = COLS * CELL_SIZE;
canvas.height = ROWS * CELL_SIZE;

let grid = createGrid();
let running = false;
let generation = 0;
let intervalId = null;

const playPauseBtn = document.getElementById('playPause');
const stepBtn = document.getElementById('step');
const randomizeBtn = document.getElementById('randomize');
const clearBtn = document.getElementById('clear');
const speedInput = document.getElementById('speed');
const speedLabel = document.getElementById('speedLabel');
const generationLabel = document.getElementById('generation');
const populationLabel = document.getElementById('population');

function createGrid() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(false));
}

function randomize() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            grid[r][c] = Math.random() < 0.3;
        }
    }
    generation = 0;
    draw();
}

function clearGrid() {
    grid = createGrid();
    generation = 0;
    running = false;
    clearInterval(intervalId);
    playPauseBtn.textContent = 'Start';
    playPauseBtn.classList.remove('active');
    draw();
}

function countNeighbors(r, c) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = (r + dr + ROWS) % ROWS;
            const nc = (c + dc + COLS) % COLS;
            if (grid[nr][nc]) count++;
        }
    }
    return count;
}

function nextGeneration() {
    const next = createGrid();
    let population = 0;

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const neighbors = countNeighbors(r, c);
            const alive = grid[r][c];

            if (alive && (neighbors === 2 || neighbors === 3)) {
                next[r][c] = true;
                population++;
            } else if (!alive && neighbors === 3) {
                next[r][c] = true;
                population++;
            }
        }
    }

    grid = next;
    generation++;
    generationLabel.textContent = `Gen: ${generation}`;
    populationLabel.textContent = `Pop: ${population}`;
    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (grid[r][c]) {
                ctx.fillStyle = '#00d4ff';
                ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
            }
        }
    }
}

function startStop() {
    running = !running;
    if (running) {
        playPauseBtn.textContent = 'Pause';
        playPauseBtn.classList.add('active');
        scheduleNext();
    } else {
        playPauseBtn.textContent = 'Start';
        playPauseBtn.classList.remove('active');
        clearInterval(intervalId);
    }
}

function scheduleNext() {
    clearInterval(intervalId);
    if (running) {
        const fps = parseInt(speedInput.value);
        intervalId = setInterval(nextGeneration, 1000 / fps);
    }
}

function getCellFromEvent(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { c: Math.floor(x / CELL_SIZE), r: Math.floor(y / CELL_SIZE) };
}

let painting = false;
let paintValue = true;

canvas.addEventListener('mousedown', (e) => {
    const { r, c } = getCellFromEvent(e);
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        painting = true;
        paintValue = !grid[r][c];
        grid[r][c] = paintValue;
        draw();
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!painting) return;
    const { r, c } = getCellFromEvent(e);
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        grid[r][c] = paintValue;
        draw();
    }
});

canvas.addEventListener('mouseup', () => { painting = false; });
canvas.addEventListener('mouseleave', () => { painting = false; });

playPauseBtn.addEventListener('click', startStop);
stepBtn.addEventListener('click', nextGeneration);
randomizeBtn.addEventListener('click', randomize);
clearBtn.addEventListener('click', clearGrid);
speedInput.addEventListener('input', () => {
    speedLabel.textContent = speedInput.value;
    if (running) scheduleNext();
});

draw();
