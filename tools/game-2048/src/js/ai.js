export class AI {
    constructor(game) {
        this.game = game;
        this.maxDepth = 5;
    }

    getBestMove() {
        const moves = ['up', 'right', 'down', 'left'];
        let bestScore = -Infinity;
        let bestMove = null;

        // Try each move
        for (const move of moves) {
            const gridCopy = JSON.parse(this.game.grid.serialize());
            const scoreCopy = this.game.score;

            // Simulate move
            this.game.grid.deserialize(gridCopy);
            const moved = this.simulateMove(move);

            if (moved) {
                const score = this.evaluatePosition(this.maxDepth);
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            }

            // Restore position
            this.game.grid.deserialize(gridCopy);
            this.game.score = scoreCopy;
        }

        return bestMove;
    }

    simulateMove(direction) {
        switch (direction) {
            case 'up': return this.game.grid.moveUp();
            case 'down': return this.game.grid.moveDown();
            case 'left': return this.game.grid.moveLeft();
            case 'right': return this.game.grid.moveRight();
        }
    }

    evaluatePosition(depth) {
        if (depth === 0 || !this.game.grid.hasPossibleMoves()) {
            return this.calculateHeuristic();
        }

        const moves = ['up', 'right', 'down', 'left'];
        let maxScore = -Infinity;

        for (const move of moves) {
            const gridCopy = JSON.parse(this.game.grid.serialize());
            const scoreCopy = this.game.score;

            if (this.simulateMove(move)) {
                const score = this.evaluatePosition(depth - 1);
                maxScore = Math.max(maxScore, score);
            }

            this.game.grid.deserialize(gridCopy);
            this.game.score = scoreCopy;
        }

        return maxScore;
    }

    calculateHeuristic() {
        let score = 0;
        const weights = [
            [4, 3, 2, 1],
            [3, 2, 1, 0],
            [2, 1, 0, -1],
            [1, 0, -1, -2]
        ];

        // Position weight
        for (let x = 0; x < 4; x++) {
            for (let y = 0; y < 4; y++) {
                const value = this.game.grid.cells[x][y];
                if (value) {
                    score += value * weights[x][y];
                }
            }
        }

        // Empty cells bonus
        const emptyCells = this.game.grid.getRandomEmptyCell() ? 1 : 0;
        score += emptyCells * 10;

        // Monotonicity bonus
        score += this.calculateMonotonicityBonus() * 20;

        return score;
    }

    calculateMonotonicityBonus() {
        let bonus = 0;

        // Check rows
        for (let x = 0; x < 4; x++) {
            let increasing = true;
            let decreasing = true;

            for (let y = 1; y < 4; y++) {
                const prev = this.game.grid.cells[x][y - 1] || 0;
                const curr = this.game.grid.cells[x][y] || 0;

                if (prev > curr) increasing = false;
                if (prev < curr) decreasing = false;
            }

            if (increasing || decreasing) bonus++;
        }

        // Check columns
        for (let y = 0; y < 4; y++) {
            let increasing = true;
            let decreasing = true;

            for (let x = 1; x < 4; x++) {
                const prev = this.game.grid.cells[x - 1][y] || 0;
                const curr = this.game.grid.cells[x][y] || 0;

                if (prev > curr) increasing = false;
                if (prev < curr) decreasing = false;
            }

            if (increasing || decreasing) bonus++;
        }

        return bonus;
    }
}