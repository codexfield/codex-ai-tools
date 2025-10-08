export class Grid {
    constructor() {
        this.size = 4;
        this.cells = this.createGrid();
    }

    createGrid() {
        const cells = [];
        for (let x = 0; x < this.size; x++) {
            const row = [];
            for (let y = 0; y < this.size; y++) {
                row.push(null);
            }
            cells.push(row);
        }
        return cells;
    }

    getRandomEmptyCell() {
        const emptyCells = [];
        this.forEachCell((x, y, value) => {
            if (!value) {
                emptyCells.push({ x, y });
            }
        });

        if (emptyCells.length > 0) {
            return emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
        return null;
    }

    insertTile(tile) {
        this.cells[tile.x][tile.y] = tile.value;
    }

    removeTile(x, y) {
        this.cells[x][y] = null;
    }

    hasEmptyCell() {
        return this.getRandomEmptyCell() !== null;
    }

    forEachCell(callback) {
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                callback(x, y, this.cells[x][y]);
            }
        }
    }

    hasValue(value) {
        let found = false;
        this.forEachCell((x, y, cellValue) => {
            if (cellValue === value) {
                found = true;
            }
        });
        return found;
    }

    serialize() {
        return JSON.stringify(this.cells);
    }

    deserialize(state) {
        this.cells = JSON.parse(state);
    }

    moveLeft() {
        return this.move((row) => {
            const newRow = row.filter(cell => cell !== null);
            for (let i = 0; i < newRow.length - 1; i++) {
                if (newRow[i] === newRow[i + 1]) {
                    newRow[i] *= 2;
                    newRow.splice(i + 1, 1);
                }
            }
            while (newRow.length < this.size) {
                newRow.push(null);
            }
            return newRow;
        });
    }

    moveRight() {
        return this.move((row) => {
            const newRow = row.filter(cell => cell !== null);
            for (let i = newRow.length - 1; i > 0; i--) {
                if (newRow[i] === newRow[i - 1]) {
                    newRow[i] *= 2;
                    newRow.splice(i - 1, 1);
                    newRow.push(null);
                }
            }
            while (newRow.length < this.size) {
                newRow.unshift(null);
            }
            return newRow;
        });
    }

    moveUp() {
        return this.move((col) => {
            const newCol = col.filter(cell => cell !== null);
            for (let i = 0; i < newCol.length - 1; i++) {
                if (newCol[i] === newCol[i + 1]) {
                    newCol[i] *= 2;
                    newCol.splice(i + 1, 1);
                }
            }
            while (newCol.length < this.size) {
                newCol.push(null);
            }
            return newCol;
        }, true);
    }

    moveDown() {
        return this.move((col) => {
            const newCol = col.filter(cell => cell !== null);
            for (let i = newCol.length - 1; i > 0; i--) {
                if (newCol[i] === newCol[i - 1]) {
                    newCol[i] *= 2;
                    newCol.splice(i - 1, 1);
                    newCol.push(null);
                }
            }
            while (newCol.length < this.size) {
                newCol.unshift(null);
            }
            return newCol;
        }, true);
    }

    move(callback, isVertical = false) {
        const before = this.serialize();

        for (let i = 0; i < this.size; i++) {
            let line = [];

            // Extract line (row or column)
            for (let j = 0; j < this.size; j++) {
                line.push(isVertical ? this.cells[j][i] : this.cells[i][j]);
            }

            // Process line
            line = callback(line);

            // Put line back
            for (let j = 0; j < this.size; j++) {
                if (isVertical) {
                    this.cells[j][i] = line[j];
                } else {
                    this.cells[i][j] = line[j];
                }
            }
        }

        return before !== this.serialize();
    }

    hasPossibleMoves() {
        // Check for adjacent equal values
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                const value = this.cells[x][y];

                if (value === null) return true;

                // Check right
                if (x < this.size - 1 && this.cells[x + 1][y] === value) return true;

                // Check down
                if (y < this.size - 1 && this.cells[x][y + 1] === value) return true;
            }
        }

        return false;
    }
}