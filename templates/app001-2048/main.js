class Game2048 {
    constructor() {
        this.gridSize = 4;
        this.grid = Array(this.gridSize).fill(0).map(() => Array(this.gridSize).fill(0));
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('2048-best-score')) || 0;
        this.isGameOver = false;
        this.init();
    }

    init() {
        this.createGrid();
        this.updateScore();
        this.addTile();
        this.addTile();
        this.setupEventListeners();
    }

    createGrid() {
        const container = document.querySelector('.grid-container');
        container.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;

        // Clear existing grid
        container.innerHTML = '';

        // Create grid cells
        for (let i = 0; i < this.gridSize * this.gridSize; i++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            container.appendChild(cell);
        }
    }

    addTile() {
        const available = [];
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 0) {
                    available.push({ x: i, y: j });
                }
            }
        }

        if (available.length > 0) {
            const randomCell = available[Math.floor(Math.random() * available.length)];
            const value = Math.random() < 0.9 ? 2 : 4;
            this.grid[randomCell.x][randomCell.y] = value;
            this.renderTile(randomCell.x, randomCell.y, value, true);
        }
    }

    renderTile(x, y, value, isNew = false) {
        const container = document.querySelector('.grid-container');
        const position = x * this.gridSize + y;
        const cell = container.children[position];

        // Remove existing tile if any
        const existingTile = cell.querySelector('.tile');
        if (existingTile) {
            cell.removeChild(existingTile);
        }

        if (value !== 0) {
            const tile = document.createElement('div');
            tile.classList.add('tile', `tile-${value}`);
            tile.textContent = value;
            cell.appendChild(tile);

            // 添加新方块动画类
            if (isNew) {
                // 确保动画正确触发
                requestAnimationFrame(() => {
                    tile.classList.add('new');
                });
            }
        }
    } updateScore() {
        document.getElementById('score').textContent = this.score;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('2048-best-score', this.bestScore);
            document.getElementById('best-score').textContent = this.bestScore;
        }
    }

    move(direction) {
        if (this.isGameOver) return;

        const previousGrid = JSON.stringify(this.grid);
        let moved = false;

        switch (direction) {
            case 'up':
                moved = this.moveVertical(true);
                break;
            case 'down':
                moved = this.moveVertical(false);
                break;
            case 'left':
                moved = this.moveHorizontal(true);
                break;
            case 'right':
                moved = this.moveHorizontal(false);
                break;
        }

        if (moved) {
            this.addTile();
            this.updateScore();

            if (this.checkGameOver()) {
                this.gameOver();
            }
        }
    }

    moveHorizontal(toLeft) {
        let moved = false;
        for (let i = 0; i < this.gridSize; i++) {
            const row = this.grid[i].filter(cell => cell !== 0);
            const zeros = Array(this.gridSize - row.length).fill(0);

            // Merge tiles
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    row.splice(j + 1, 1);
                    zeros.push(0);
                    this.score += row[j];
                    moved = true;
                }
            }

            // Create new row
            const newRow = toLeft ? [...row, ...zeros] : [...zeros, ...row];

            // Check if anything moved
            if (JSON.stringify(this.grid[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }

            this.grid[i] = newRow;

            // Update display
            for (let j = 0; j < this.gridSize; j++) {
                this.renderTile(i, j, this.grid[i][j]);
            }
        }
        return moved;
    }

    moveVertical(toTop) {
        let moved = false;
        for (let j = 0; j < this.gridSize; j++) {
            let column = [];
            for (let i = 0; i < this.gridSize; i++) {
                column.push(this.grid[i][j]);
            }

            column = column.filter(cell => cell !== 0);
            const zeros = Array(this.gridSize - column.length).fill(0);

            // Merge tiles
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] *= 2;
                    column.splice(i + 1, 1);
                    zeros.push(0);
                    this.score += column[i];
                    moved = true;
                }
            }

            // Create new column
            const newColumn = toTop ? [...column, ...zeros] : [...zeros, ...column];

            // Check if anything moved
            let oldColumn = [];
            for (let i = 0; i < this.gridSize; i++) {
                oldColumn.push(this.grid[i][j]);
            }
            if (JSON.stringify(oldColumn) !== JSON.stringify(newColumn)) {
                moved = true;
            }

            // Update grid and display
            for (let i = 0; i < this.gridSize; i++) {
                this.grid[i][j] = newColumn[i];
                this.renderTile(i, j, this.grid[i][j]);
            }
        }
        return moved;
    }

    checkGameOver() {
        // Check for empty cells
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if (this.grid[i][j] === 0) return false;
            }
        }

        // Check for possible merges
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                const current = this.grid[i][j];
                // Check right neighbor
                if (j < this.gridSize - 1 && current === this.grid[i][j + 1]) return false;
                // Check bottom neighbor
                if (i < this.gridSize - 1 && current === this.grid[i + 1][j]) return false;
            }
        }

        return true;
    }

    gameOver() {
        this.isGameOver = true;
        const message = document.querySelector('.game-message');
        message.classList.add('game-over');
        message.querySelector('p').textContent = 'Game Over!';
    }

    resetGame() {
        this.grid = Array(this.gridSize).fill(0).map(() => Array(this.gridSize).fill(0));
        this.score = 0;
        this.isGameOver = false;
        this.updateScore();
        document.querySelector('.game-message').classList.remove('game-over');
        this.createGrid();
        this.addTile();
        this.addTile();
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.move('down');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    this.move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.move('right');
                    break;
            }
        });

        // Touch controls
        let touchStartX, touchStartY;
        const gameContainer = document.querySelector('.game-container');

        gameContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            e.preventDefault();
        }, { passive: false });

        gameContainer.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        gameContainer.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 0) {
                    this.move('right');
                } else {
                    this.move('left');
                }
            } else {
                if (diffY > 0) {
                    this.move('down');
                } else {
                    this.move('up');
                }
            }

            touchStartX = null;
            touchStartY = null;
            e.preventDefault();
        }, { passive: false });

        // New game button
        document.getElementById('new-game').addEventListener('click', () => this.resetGame());
        document.querySelector('.retry-button').addEventListener('click', () => this.resetGame());
    }
}

// Start game
window.onload = () => new Game2048();