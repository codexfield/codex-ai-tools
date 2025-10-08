import { Grid } from './grid.js';
import { Tile } from './tile.js';
import { AI } from './ai.js';

export class Game {
    constructor() {
        this.grid = new Grid();
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
        this.gameOver = false;
        this.won = false;
        this.ai = new AI(this);
        this.aiEnabled = false;
        this.moveHistory = [];
        this.setupEventListeners();
        this.setupInitialTiles();
        this.updateUI();
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleInput.bind(this));
        document.getElementById('ai-button').addEventListener('click', () => this.toggleAI());
        document.getElementById('undo-button').addEventListener('click', () => this.undoMove());
        document.querySelector('.retry-button').addEventListener('click', () => this.restart());

        // Touch events
        let touchStartX, touchStartY;
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 0) this.move('right');
                else this.move('left');
            } else {
                if (deltaY > 0) this.move('down');
                else this.move('up');
            }

            touchStartX = null;
            touchStartY = null;
        });
    }

    setupInitialTiles() {
        this.addRandomTile();
        this.addRandomTile();
    }

    handleInput(event) {
        if (this.gameOver || this.won) return;

        switch (event.key) {
            case 'ArrowUp':
                event.preventDefault();
                this.move('up');
                break;
            case 'ArrowDown':
                event.preventDefault();
                this.move('down');
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.move('left');
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.move('right');
                break;
            case 'a':
            case 'A':
                this.toggleAI();
                break;
            case 'u':
            case 'U':
                this.undoMove();
                break;
        }
    }

    move(direction) {
        const previousState = this.grid.serialize();
        const previousScore = this.score;

        let moved = false;
        switch (direction) {
            case 'up':
                moved = this.grid.moveUp();
                break;
            case 'down':
                moved = this.grid.moveDown();
                break;
            case 'left':
                moved = this.grid.moveLeft();
                break;
            case 'right':
                moved = this.grid.moveRight();
                break;
        }

        if (moved) {
            this.moveHistory.push({
                grid: previousState,
                score: previousScore
            });
            this.addRandomTile();
            this.updateScore();
            this.checkGameEnd();
            this.updateUI();
        }

        if (this.aiEnabled && !this.gameOver && !this.won) {
            setTimeout(() => this.aiMove(), 100);
        }
    }

    addRandomTile() {
        const emptyCell = this.grid.getRandomEmptyCell();
        if (emptyCell) {
            const value = Math.random() < 0.9 ? 2 : 4;
            const tile = new Tile(emptyCell.x, emptyCell.y, value);
            this.grid.insertTile(tile);
        }
    }

    updateScore() {
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore', this.bestScore);
        }
    }

    checkGameEnd() {
        if (!this.grid.hasEmptyCell() && !this.grid.hasPossibleMoves()) {
            this.gameOver = true;
        }
        if (this.grid.hasValue(2048) && !this.won) {
            this.won = true;
        }
    }

    updateUI() {
        const container = document.querySelector('.grid-container');
        container.innerHTML = '';

        // Create grid cells
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            container.appendChild(cell);
        }

        // Update tiles
        this.grid.forEachCell((x, y, value) => {
            if (value) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.dataset.value = value;
                tile.textContent = value;
                tile.style.transform = `translate(${x * (100 + 10)}px, ${y * (100 + 10)}px)`;
                container.appendChild(tile);
            }
        });

        // Update scores
        document.getElementById('score').textContent = this.score;
        document.getElementById('best-score').textContent = this.bestScore;

        // Update game state message
        const messageContainer = document.querySelector('.game-message');
        messageContainer.className = 'game-message';
        if (this.won) {
            messageContainer.classList.add('game-won');
            messageContainer.querySelector('p').textContent = 'You win!';
        } else if (this.gameOver) {
            messageContainer.classList.add('game-over');
            messageContainer.querySelector('p').textContent = 'Game over!';
        }
    }

    toggleAI() {
        this.aiEnabled = !this.aiEnabled;
        document.getElementById('ai-button').textContent =
            this.aiEnabled ? 'Disable AI (A)' : 'Enable AI (A)';
        if (this.aiEnabled) {
            this.aiMove();
        }
    }

    aiMove() {
        if (this.aiEnabled && !this.gameOver && !this.won) {
            const move = this.ai.getBestMove();
            if (move) {
                this.move(move);
            }
        }
    }

    undoMove() {
        if (this.moveHistory.length > 0) {
            const lastMove = this.moveHistory.pop();
            this.grid.deserialize(lastMove.grid);
            this.score = lastMove.score;
            this.gameOver = false;
            this.won = false;
            this.updateUI();
        }
    }

    restart() {
        this.grid = new Grid();
        this.score = 0;
        this.gameOver = false;
        this.won = false;
        this.moveHistory = [];
        this.setupInitialTiles();
        this.updateUI();
    }
}

// Start the game
new Game();