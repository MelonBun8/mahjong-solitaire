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
    
    // Count how many new tiles would be unlocked by making a move
    countUnlockedTiles(move) {
        const [coord1, coord2] = move;
        
        // Make a copy of current coords
        const originalCoords = [...this.game.currentCoords];
        
        // Count original open tiles (excluding the two we're about to remove)
        let originalOpenCount = 0;
        for (const coord of originalCoords) {
            if (coord.toString() !== coord1.toString() && 
                coord.toString() !== coord2.toString() &&
                isOpen(coord, originalCoords)) {
                originalOpenCount++;
            }
        }
        
        // Remove the two tiles to simulate making this move
        const tempCoords = originalCoords.filter(c => 
            c.toString() !== coord1.toString() && 
            c.toString() !== coord2.toString()
        );
        
        // Count new open tiles
        let newOpenCount = 0;
        for (const coord of tempCoords) {
            if (isOpen(coord, tempCoords)) {
                newOpenCount++;
            }
        }
        
        // Return the difference (how many new tiles were unlocked)
        return Math.max(0, newOpenCount - originalOpenCount);
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
        const randomMove = randEl(moves);
        
        // Execute the move
        await this.executeAIMove(randomMove[0], randomMove[1]);
    }
    
    async executeAIMove(coord1, coord2) {
        // Add slight delay to make the AI moves visible
        await sleep(500);
        
        // Calculate unlocked tiles for scoring
        const unlockedTiles = this.countUnlockedTiles([coord1, coord2]);
        
        // Select first tile
        this.game.selectTileAt(coord1);
        await sleep(300);
        
        // Select second tile to complete the move
        const tile1 = tileAt(coord1, this.game.gameId);
        const tile2 = tileAt(coord2, this.game.gameId);
        
        // Update the executeMove function to pass the unlocked tiles count
        await this.game.executeMove(tile2, tile1, coord2, coord1, unlockedTiles);
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
                score: this.evaluateMove(move),
                unlockedTiles: this.countUnlockedTiles(move)
            };
        });
        
        // Sort by score (descending)
        scoredMoves.sort((a, b) => b.score - a.score);
        
        // Pick the best move
        const bestMove = scoredMoves[0];
        await this.executeAIMove(bestMove.move[0], bestMove.move[1], bestMove.unlockedTiles);
    }
    
    // Score a move based on how many tiles it would potentially unlock
    evaluateMove(move) {
        const unlockedTiles = this.countUnlockedTiles(move);
        return unlockedTiles * 10; // Weight unlocked tiles heavily
    }
    
    async executeAIMove(coord1, coord2, unlockedTiles = 0) {
        // Add slight delay to make the AI moves visible
        await sleep(400);
        
        // Select first tile
        this.game.selectTileAt(coord1);
        await sleep(250);
        
        // Select second tile to complete the move
        const tile1 = tileAt(coord1, this.game.gameId);
        const tile2 = tileAt(coord2, this.game.gameId);
        
        // Pass unlocked tiles count for scoring
        await this.game.executeMove(tile2, tile1, coord2, coord1, unlockedTiles);
    }
}

// Hard Level: Improved search with performance optimizations
export class HardAI extends MahjongAI {
    constructor(gameInstance) {
        super(gameInstance);
        this.difficultyLevel = "Hard";
        this.maxDepth = 2; // Reduced from 3 to avoid freezing
        this.moveCache = new Map(); // Cache for move evaluations
    }

    async makeMove() {
        if (!this.game.isActive) return;
        
        // Find all available moves
        const moves = this.findAvailableMoves();
        
        if (moves.length === 0) return;
        
        // Performance optimization - if too many moves, limit search depth
        if (moves.length > 20) {
            this.maxDepth = 1;
        } else {
            this.maxDepth = 2;
        }
        
        // Score each move with limited lookahead
        const scoredMoves = [];
        
        for (const move of moves) {
            const unlockedTiles = this.countUnlockedTiles(move);
            const lookAheadScore = this.evaluateLookAhead(move, this.maxDepth);
            
            scoredMoves.push({
                move: move,
                score: lookAheadScore,
                unlockedTiles: unlockedTiles
            });
        }
        
        // Sort by score (descending)
        scoredMoves.sort((a, b) => b.score - a.score);
        
        // Pick one of the top moves (add some randomness to make it less predictable)
        const topMoves = scoredMoves.slice(0, Math.min(3, scoredMoves.length));
        const selectedMove = randEl(topMoves);
        
        await this.executeAIMove(
            selectedMove.move[0], 
            selectedMove.move[1], 
            selectedMove.unlockedTiles
        );
    }
    
    // Evaluate a move with limited lookahead
    evaluateLookAhead(move, depth) {
        const [coord1, coord2] = move;
        
        // Calculate immediate benefit
        const unlockedTiles = this.countUnlockedTiles(move);
        let score = unlockedTiles * 10;
        
        // Base case - no more lookahead
        if (depth <= 0) return score;
        
        // Create new board state after this move
        const newCoords = [...this.game.currentCoords].filter(c => 
            c.toString() !== coord1.toString() && 
            c.toString() !== coord2.toString()
        );
        
        // Find all possible next moves in this state
        const nextMoves = this.findMovesForCoords(newCoords);
        
        if (nextMoves.length === 0) {
            // Game would end after this move - penalize slightly
            return score - 5; 
        }
        
        // Get the best next move score with reduced depth
        let bestNextScore = -Infinity;
        for (const nextMove of nextMoves.slice(0, 5)) { // Limit to top 5 moves for performance
            const nextMoveScore = this.evaluateLookAhead(nextMove, depth - 1);
            bestNextScore = Math.max(bestNextScore, nextMoveScore);
        }
        
        // Add a portion of the best next move score
        score += bestNextScore * 0.7; // Discount future moves
        
        return score;
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
    
    async executeAIMove(coord1, coord2, unlockedTiles = 0) {
        // Add slight delay to make the AI moves visible
        await sleep(350);
        
        // Select first tile
        this.game.selectTileAt(coord1);
        await sleep(200);
        
        // Select second tile to complete the move
        const tile1 = tileAt(coord1, this.game.gameId);
        const tile2 = tileAt(coord2, this.game.gameId);
        
        // Pass unlocked tiles count for scoring
        await this.game.executeMove(tile2, tile1, coord2, coord1, unlockedTiles);
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