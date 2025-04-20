// scoreSystem.js

// Calculate score based on removed tiles and tile strategic value
export class ScoreSystem {
    constructor() {
        this.scores = {
            1: 0, // Player 1 score
            2: 0  // Player 2 (Bot) score
        };
        this.tilesRemoved = {
            1: 0,
            2: 0
        };
        this.baseTileValue = 10; // Base points per tile pair
        this.strategicBonus = true; // Whether to award strategic bonus
    }
    
     // Add points for removing a tile pair
     addPoints(playerNumber, unlockedTiles = 0) {
        // Base points for removing a tile pair
        let points = this.baseTileValue;
        
        // Add strategic bonus based on how many tiles this move unlocks
        if (this.strategicBonus) {
            // Each unlocked tile adds 2 points to the score
            const strategyBonus = unlockedTiles * 2;
            points += strategyBonus;
            
            // Log the scoring details for debugging
            console.log(`Player ${playerNumber} move: +${this.baseTileValue} base points + ${strategyBonus} strategy bonus (${unlockedTiles} tiles unlocked) = ${points} total`);
        }
        
        // Track tiles removed
        this.tilesRemoved[playerNumber] += 2;
        
        // Add points to score
        this.scores[playerNumber] += points;
        
        // Update score display
        this.updateScoreDisplay();
        
        return points;
    }
    
    // Calculate how many tiles would be unlocked by removing two tiles
    calculateUnlockedTiles(coords, move) {
        if (!move || move.length !== 2) return 0;
        
        // Make a copy of current coords
        const originalCoords = [...coords];
        const [coord1, coord2] = move;
        
        // Count original open tiles
        let originalOpenCount = 0;
        for (const coord of originalCoords) {
            if (this.isOpen(coord, originalCoords)) {
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
            if (this.isOpen(coord, tempCoords)) {
                newOpenCount++;
            }
        }
        
        // Return the difference (how many new tiles were unlocked)
        return Math.max(0, newOpenCount - (originalOpenCount - 2));
    }
    
    // Check if a tile is open (no tiles above it and at least one side free)
    isOpen(coord, allCoords) {
        // Implementation of isOpen logic (can reuse from coordinates.js)
        // This is a placeholder - you should either import isOpen or implement it here
        return true; // Replace with actual implementation
    }
    
     // Reset scores
     reset() {
        this.scores = { 1: 0, 2: 0 };
        this.tilesRemoved = { 1: 0, 2: 0 };
        this.updateScoreDisplay();
    }
    
    // Update score displays
    updateScoreDisplay() {
        $("#score1").text(`Score: ${this.scores[1]}`);
        $("#score2").text(`Score: ${this.scores[2]}`);
    }
    
    getWinner() {
        if (this.scores[1] > this.scores[2]) {
            return 1;
        } else if (this.scores[2] > this.scores[1]) {
            return 2;
        } else {
            return 0; // Tie
        }
    }
    
    // Get current leader
    getCurrentLeader() {
        if (this.scores[1] > this.scores[2]) {
            return 1;
        } else if (this.scores[2] > this.scores[1]) {
            return 2;
        } else {
            return 0; // Tie
        }
    }
}