// mahjongAI.js
import { isOpen, COORDINATES } from "./coordinates.js";
import { tileAt, randEl, sleep } from "./utils.js";

// Base AI class that all difficulty levels will extend
class MahjongAI {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.difficultyLevel = "Easy"; // Default
    }

    async makeMove() {
        // To be implemented by subclasses
    }

    // Find all possible moves (tile pairs that can be matched)
    findAvailableMoves() {
        const moves = [];
        const coords = this.game.currentCoords;
        
        for (let i = 0; i < coords.length; i++) {
            for (let j = i + 1; j < coords.length; j++) {
                const p = coords[i];
                const q = coords[j];
                if (
                    p.toString() !== q.toString() &&
                    tileAt(p, this.game.gameId).attr("type") === tileAt(q, this.game.gameId).attr("type") &&
                    isOpen(p, this.game.currentCoords) &&
                    isOpen(q, this.game.currentCoords)
                ) {
                    moves.push([p, q]);
                }
            }
        }
        return moves;
    }
}

// Easy Level: Simple Reflex Agent
export class EasyAI extends MahjongAI {
    constructor(gameInstance) {
        super(gameInstance);
        this.difficultyLevel = "Easy";
    }

    async makeMove() {
        if (!this.game.isActive) return;
        
        // Find all available moves
        const moves = this.findAvailableMoves();
        
        if (moves.length === 0) return;
        
        // Select a random move
        const [tile1, tile2] = randEl(moves);
        
        // Execute the move
        await this.executeAIMove(tile1, tile2);
    }
    
    async executeAIMove(coord1, coord2) {
        // Add slight delay to make the AI moves visible
        await sleep(500);
        
        // Select first tile
        this.game.selectTileAt(coord1);
        await sleep(300);
        
        // Select second tile to complete the move
        const tile1 = tileAt(coord1, this.game.gameId);
        const tile2 = tileAt(coord2, this.game.gameId);
        
        await this.game.executeMove(tile2, tile1, coord2, coord1);
    }
}

// Medium Level: Model-Based Agent using Heuristics
export class MediumAI extends MahjongAI {
    constructor(gameInstance) {
        super(gameInstance);
        this.difficultyLevel = "Medium";
    }

    async makeMove() {
        if (!this.game.isActive) return;
        
        // Find all available moves
        const moves = this.findAvailableMoves();
        
        if (moves.length === 0) return;
        
        // Score each move and pick the best one
        const scoredMoves = moves.map(move => {
            return {
                move: move,
                score: this.evaluateMove(move)
            };
        });
        
        // Sort by score (descending)
        scoredMoves.sort((a, b) => b.score - a.score);
        
        // Pick the best move
        const bestMove = scoredMoves[0].move;
        await this.executeAIMove(bestMove[0], bestMove[1]);
    }
    
    // Score a move based on how many tiles it would potentially unlock
    evaluateMove(move) {
        const [coord1, coord2] = move;
        
        // Make a copy of current coords
        const tempCoords = [...this.game.currentCoords];
        
        // Remove the two tiles to simulate making this move
        tempCoords.splice(tempCoords.findIndex(c => c.toString() === coord1.toString()), 1);
        tempCoords.splice(tempCoords.findIndex(c => c.toString() === coord2.toString()), 1);
        
        // Count how many open tiles we'd have after making this move
        let openCount = 0;
        for (const coord of tempCoords) {
            if (isOpen(coord, tempCoords)) {
                openCount++;
            }
        }
        
        return openCount;
    }
    
    async executeAIMove(coord1, coord2) {
        // Add slight delay to make the AI moves visible
        await sleep(400);
        
        // Select first tile
        this.game.selectTileAt(coord1);
        await sleep(250);
        
        // Select second tile to complete the move
        const tile1 = tileAt(coord1, this.game.gameId);
        const tile2 = tileAt(coord2, this.game.gameId);
        
        await this.game.executeMove(tile2, tile1, coord2, coord1);
    }
}

// Hard Level: Minimax Agent with Search Tree
export class HardAI extends MahjongAI {
    constructor(gameInstance) {
        super(gameInstance);
        this.difficultyLevel = "Hard";
        this.maxDepth = 3; // Look ahead this many moves
    }

    async makeMove() {
        if (!this.game.isActive) return;
        
        // Find all available moves
        const moves = this.findAvailableMoves();
        
        if (moves.length === 0) return;
        
        // Find the best move using minimax
        let bestScore = -Infinity;
        let bestMove = null;
        
        for (const move of moves) {
            // Simulate making this move
            const tempCoords = [...this.game.currentCoords];
            tempCoords.splice(tempCoords.findIndex(c => c.toString() === move[0].toString()), 1);
            tempCoords.splice(tempCoords.findIndex(c => c.toString() === move[1].toString()), 1);
            
            // Calculate score through minimax
            const score = this.minimax(tempCoords, 1, false);
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        if (bestMove) {
            await this.executeAIMove(bestMove[0], bestMove[1]);
        }
    }
    
    // Minimax algorithm with alpha-beta pruning
    minimax(coords, depth, isMaximizing, alpha = -Infinity, beta = Infinity) {
        // Terminal conditions
        if (depth === this.maxDepth || coords.length === 0) {
            return this.evaluateBoard(coords, isMaximizing);
        }
        
        // Find all possible moves in this state
        const moves = this.findMovesForCoords(coords);
        
        if (moves.length === 0) {
            return isMaximizing ? -1000 : 1000; // Game over, no moves left
        }
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            
            for (const move of moves) {
                // Create a new board state after this move
                const newCoords = [...coords];
                newCoords.splice(newCoords.findIndex(c => c.toString() === move[0].toString()), 1);
                newCoords.splice(newCoords.findIndex(c => c.toString() === move[1].toString()), 1);
                
                // Recurse
                const score = this.minimax(newCoords, depth + 1, false, alpha, beta);
                bestScore = Math.max(score, bestScore);
                
                // Alpha-beta pruning
                alpha = Math.max(alpha, bestScore);
                if (beta <= alpha) break;
            }
            
            return bestScore;
        } else {
            let bestScore = Infinity;
            
            for (const move of moves) {
                // Create a new board state after this move
                const newCoords = [...coords];
                newCoords.splice(newCoords.findIndex(c => c.toString() === move[0].toString()), 1);
                newCoords.splice(newCoords.findIndex(c => c.toString() === move[1].toString()), 1);
                
                // Recurse
                const score = this.minimax(newCoords, depth + 1, true, alpha, beta);
                bestScore = Math.min(score, bestScore);
                
                // Alpha-beta pruning
                beta = Math.min(beta, bestScore);
                if (beta <= alpha) break;
            }
            
            return bestScore;
        }
    }
    
    // Find all possible moves for a given set of coordinates
    findMovesForCoords(coords) {
        const moves = [];
        
        for (let i = 0; i < coords.length; i++) {
            for (let j = i + 1; j < coords.length; j++) {
                const p = coords[i];
                const q = coords[j];
                if (
                    p.toString() !== q.toString() &&
                    tileAt(p, this.game.gameId).attr("type") === tileAt(q, this.game.gameId).attr("type") &&
                    isOpen(p, coords) &&
                    isOpen(q, coords)
                ) {
                    moves.push([p, q]);
                }
            }
        }
        
        return moves;
    }
    
    // Evaluation function for the minimax algorithm
    evaluateBoard(coords, isMaximizing) {
        // Count available moves
        const moves = this.findMovesForCoords(coords);
        
        // Calculate mobility (available moves)
        const mobility = moves.length;
        
        // Count open tiles
        let openTiles = 0;
        for (const coord of coords) {
            if (isOpen(coord, coords)) {
                openTiles++;
            }
        }
        
        // Scoring:
        // - If maximizing (AI's turn), prefer states with more moves
        // - If minimizing (Player's turn), prefer states with fewer moves
        const mobilityScore = isMaximizing ? mobility : -mobility;
        
        // Also consider how many tiles are left overall
        const tilesRemaining = coords.length;
        const tilesScore = -tilesRemaining; // Prefer fewer tiles
        
        return mobilityScore * 2 + tilesScore + openTiles;
    }
    
    async executeAIMove(coord1, coord2) {
        // Add slight delay to make the AI moves visible
        await sleep(350);
        
        // Select first tile
        this.game.selectTileAt(coord1);
        await sleep(200);
        
        // Select second tile to complete the move
        const tile1 = tileAt(coord1, this.game.gameId);
        const tile2 = tileAt(coord2, this.game.gameId);
        
        await this.game.executeMove(tile2, tile1, coord2, coord1);
    }
}

// Factory function to create the appropriate AI based on difficulty
export function createAI(gameInstance, difficulty = "Medium") {
    switch(difficulty) {
        case "Easy":
            return new EasyAI(gameInstance);
        case "Medium":
            return new MediumAI(gameInstance);
        case "Hard":
            return new HardAI(gameInstance);
        default:
            return new MediumAI(gameInstance);
    }
}