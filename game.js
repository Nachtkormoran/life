const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const CELL_SIZE = 8;
let COLS = 80;
let ROWS = 50;

canvas.width = COLS * CELL_SIZE;
canvas.height = ROWS * CELL_SIZE;

const RULES = {
    conway:     { birth: [3],          survive: [2, 3] },
    highlife:   { birth: [3, 6],       survive: [2, 3] },
    daynight:   { birth: [3, 6, 7, 8], survive: [3, 4, 6, 7, 8] },
    anneal:     { birth: [4, 6, 7, 8], survive: [3, 5, 6, 7, 8] },
    regrowth:   { birth: [3, 1],       survive: [2, 3] },
    briansbrain: null,
};

const PATTERNS = {
    rpentomino: [
        [0, 1], [1, 0], [1, 1], [1, 2], [2, 0],
    ],
    gun: [
        [0, 24],
        [1, 22], [1, 24],
        [2, 12], [2, 13], [2, 20], [2, 21], [2, 34], [2, 35],
        [3, 11], [3, 15], [3, 20], [3, 21], [3, 34], [3, 35],
        [4, 0], [4, 1], [4, 10], [4, 16], [4, 20], [4, 21],
        [5, 0], [5, 1], [5, 10], [5, 14], [5, 16], [5, 17], [5, 22], [5, 24],
        [6, 10], [6, 16], [6, 24],
        [7, 11], [7, 15],
        [8, 12], [8, 13],
    ],
    diehard: [
        [0, 6],
        [1, 0], [1, 1],
        [2, 1], [2, 5], [2, 6], [2, 7],
    ],
    acorn: [
        [0, 1],
        [1, 3],
        [2, 0], [2, 1], [2, 4], [2, 5], [2, 6],
    ],
};

const ruleSelect = document.getElementById('ruleSelect');
const patternSelect = document.getElementById('patternSelect');
const spawnPatternBtn = document.getElementById('spawnPattern');
const sizeSelect = document.getElementById('sizeSelect');
const fadeModeCheckbox = document.getElementById('fadeMode');
const playPauseBtn = document.getElementById('playPause');
const stepBtn = document.getElementById('step');
const clearBtn = document.getElementById('clear');
const speedInput = document.getElementById('speed');
const speedLabel = document.getElementById('speedLabel');
const generationLabel = document.getElementById('generation');
const populationLabel = document.getElementById('population');

let currentRule = RULES.conway;
let currentRuleName = 'conway';
let fadeMode = false;
let grid;
let running = false;
let generation = 0;
let intervalId = null;

function createGrid(cols, rows) {
    return Array.from({ length: rows || ROWS }, () => Array(cols || COLS).fill(0));
}

function initGrid() {
    const [c, r] = sizeSelect.value.split('x').map(Number);
    COLS = c;
    ROWS = r;
    canvas.width = COLS * CELL_SIZE;
    canvas.height = ROWS * CELL_SIZE;
    grid = createGrid();
    generation = 0;
}

function applyPattern(name) {
    if (currentRuleName === 'briansbrain') {
        grid = createGrid();
    } else {
        grid = createGrid();
    }

    const pattern = PATTERNS[name];
    if (!pattern) return;

    const cx = Math.floor(COLS / 2);
    const cy = Math.floor(ROWS / 2);

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const [y, x] of pattern) {
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
    const pw = maxX - minX;
    const ph = maxY - minY;
    const offX = cx - Math.floor(pw / 2);
    const offY = cy - Math.floor(ph / 2);

    for (const [y, x] of pattern) {
        const nr = y - minY + offY;
        const nc = x - minX + offX;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            grid[nr][nc] = 1;
        }
    }
}

function randomize() {
    grid = createGrid();
    const density = currentRuleName === 'briansbrain' ? 0.3 : 0.3;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            grid[r][c] = Math.random() < density ? 1 : 0;
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
    playPauseBtn.innerHTML = '<span class="icon">&#9654;</span> Start';
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
            if (grid[nr][nc] === 1) count++;
        }
    }
    return count;
}

function countAllAliveNeighbors(r, c) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = (r + dr + ROWS) % ROWS;
            const nc = (c + dc + COLS) % COLS;
            if (grid[nr][nc] >= 1) count++;
        }
    }
    return count;
}

function nextGeneration() {
    let population = 0;

    if (currentRuleName === 'briansbrain') {
        const next = createGrid();
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const state = grid[r][c];
                if (state === 1) {
                    next[r][c] = 2;
                    population++;
                } else if (state === 2) {
                    next[r][c] = 0;
                } else {
                    const neighbors = countNeighbors(r, c);
                    if (neighbors === 2) {
                        next[r][c] = 1;
                        population++;
                    }
                }
            }
        }
        grid = next;
    } else if (fadeMode) {
        const next = createGrid();
        const { birth, survive } = currentRule;

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const state = grid[r][c];
                const neighbors = countNeighbors(r, c);

                if (state === 1) {
                    if (survive.includes(neighbors)) {
                        next[r][c] = 1;
                        population++;
                    } else {
                        next[r][c] = 2;
                    }
                } else if (state === 2) {
                    if (neighbors >= 1 && neighbors <= 3) {
                        next[r][c] = 1;
                        population++;
                    } else {
                        next[r][c] = 0;
                    }
                } else {
                    if (birth.includes(neighbors)) {
                        next[r][c] = 1;
                        population++;
                    }
                }
            }
        }
        grid = next;
    } else {
        const next = createGrid();
        const { birth, survive } = currentRule;

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const neighbors = countNeighbors(r, c);
                const alive = grid[r][c] === 1;

                if (alive && survive.includes(neighbors)) {
                    next[r][c] = 1;
                    population++;
                } else if (!alive && birth.includes(neighbors)) {
                    next[r][c] = 1;
                    population++;
                }
            }
        }
        grid = next;
    }

    generation++;
    generationLabel.textContent = generation;
    populationLabel.textContent = population;
    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const state = grid[r][c];
            if (state === 0) continue;

            if (currentRuleName === 'briansbrain') {
                ctx.fillStyle = state === 1 ? '#00e676' : '#2a5a3a';
            } else if (fadeMode) {
                ctx.fillStyle = state === 1 ? '#00e676' : '#2a5a3a';
            } else {
                ctx.fillStyle = '#00e676';
            }
            ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
        }
    }
}

function startStop() {
    running = !running;
    if (running) {
        playPauseBtn.innerHTML = '<span class="icon">&#9724;</span> Pause';
        playPauseBtn.classList.add('active');
        scheduleNext();
    } else {
        playPauseBtn.innerHTML = '<span class="icon">&#9654;</span> Start';
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
let paintValue = 1;

canvas.addEventListener('mousedown', (e) => {
    const { r, c } = getCellFromEvent(e);
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        painting = true;
        paintValue = grid[r][c] === 0 ? 1 : 0;
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
clearBtn.addEventListener('click', clearGrid);

spawnPatternBtn.addEventListener('click', () => {
    const name = patternSelect.value;
    if (name === 'random') {
        randomize();
    } else {
        applyPattern(name);
        draw();
    }
});

ruleSelect.addEventListener('change', () => {
    currentRuleName = ruleSelect.value;
    currentRule = RULES[currentRuleName];
});

fadeModeCheckbox.addEventListener('change', () => {
    fadeMode = fadeModeCheckbox.checked;
});

sizeSelect.addEventListener('change', () => {
    initGrid();
    draw();
});

speedInput.addEventListener('input', () => {
    speedLabel.textContent = speedInput.value;
    if (running) scheduleNext();
});

initGrid();
draw();
