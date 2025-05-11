import { images } from "./images.js";
import { createTiles } from "./createTiles.js";
import {
    shuffle,
    remove,
    tileAt,
    tileFrontAt,
    writeStatus,
    randEl,
    sleep,
} from "./utils.js";
import { isOpen, COORDINATES, updateCoordinates } from "./coordinates.js";
import {} from "./infoText.js";
import { createAI } from "./mahjongAI.js";
import { ScoreSystem } from "./scoreSystem.js";
import { GameOutcome } from "./gameOutcome.js";

// Global instances for score and outcome
const scoreSystem = new ScoreSystem();
const gameOutcome = new GameOutcome();
let currentDifficulty = "Medium"; // Default difficulty

class GameInstance {
    constructor(gameId, playerNumber) {
        this.gameId = gameId;
        this.playerNumber = playerNumber;
        this.selectedCoord = null;
        this.currentCoords = [...COORDINATES];
        this.hintCoord = null;
        this.isActive = true;
        this.isAI = playerNumber === 2; // Player 2 is AI
        this.ai = null;
        
        if (this.isAI) {
            // Initialize AI with Medium difficulty by default
            this.ai = createAI(this, currentDifficulty);
        }
    }
    
    clickTileAt(coord) {
        if (!this.isActive) return;
        if (!isOpen(coord, this.currentCoords)) return;
    
        if (this.selectedCoord) {
            if (coord.toString() === this.selectedCoord.toString()) {
                this.unselectTileAt(coord);
                return;
            } else {
                const tile = tileAt(coord, this.gameId);
                const selectedTile = tileAt(this.selectedCoord, this.gameId);
                if (tile.attr("type") === selectedTile.attr("type")) {
                    // Calculate unlocked tiles before executing the move
                    const unlockedTiles = this.calculateUnlockedTiles([this.selectedCoord, coord]);
                    this.executeMove(tile, selectedTile, coord, this.selectedCoord, unlockedTiles);
                    return;
                }
            }
        }
        this.selectTileAt(coord);
    }

    async executeMove(tile, selectedTile, coord, coord2, unlockedTiles = 0) { 
        this.selectedCoord = null;
        this.hintCoord = null;
        
        // Add points for this move, including the unlocked tiles information
        const points = scoreSystem.addPoints(this.playerNumber, unlockedTiles);
        
        // Animate the points
        this.animatePoints(points, coord);
        
        selectedTile.animate({ opacity: 0 }, "fast");
        tile.animate({ opacity: 0 }, "fast", async () => {
            selectedTile.hide();
            tile.hide();
            remove(coord, this.currentCoords);
            remove(coord2, this.currentCoords);
            
            if (this.currentCoords.length === 0) {
                this.isActive = false;
                writeStatus(`Player ${this.playerNumber} won! 🎉`, this.playerNumber);
                // Disable the other game
                if (this.playerNumber === 1) {
                    game2.isActive = false;
                    writeStatus("Player 1 won!", 2);
                    
                    // Show win screen after a brief delay
                    await sleep(1000);
                    gameOutcome.show("win", scoreSystem.scores);
                } else {
                    game1.isActive = false;
                    writeStatus("Player 2 won!", 1);
                    
                    // Show lose screen after a brief delay
                    await sleep(1000);
                    gameOutcome.show("lose", scoreSystem.scores);
                }
            } else {
                await this.checkMovePossible();
                
                // If this was Player 1's move and the AI is active, let AI make its move
                if (this.playerNumber === 1 && game2.isActive) {
                    await game2.makeAIMove();
                }
            }
        });
    }

    calculateUnlockedTiles(move) {
        const [coord1, coord2] = move;
        
        // Make a copy of current coords
        const originalCoords = [...this.currentCoords];
        
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
    
    // Animate points display
    animatePoints(points, coord) {
        const [x, y, z] = coord;
        const offset = this.gameId === "game1" ? 0 : $("#game1").width() + 20;
        
        // Create points element
        const pointsEl = $("<div></div>")
            .addClass("points-animation")
            .text(`+${points}`)
            .css({
                left: (x * 56 + offset + 30) + "px",
                top: (y * 80 + 40) + "px",
                color: this.playerNumber === 1 ? "#4caf50" : "#ff9800"
            });
        
        // Add to body and animate
        $("body").append(pointsEl);
        
        // Animate upwards and fade out
        pointsEl.animate({
            top: "-=50",
            opacity: 0
        }, 1000, function() {
            $(this).remove();
        });
    }

    selectTileAt(coord) {
        if (!coord) return;
        this.unselectTileAt(this.selectedCoord);
        this.selectedCoord = coord;
        tileFrontAt(coord, this.gameId).addClass("selectedTile");
    }

    unselectTileAt(coord) {
        if (!coord) return;
        tileFrontAt(coord, this.gameId).removeClass("selectedTile");
        this.selectedCoord = null;
    }

    async checkMovePossible() {
        await sleep(50);
        const moves = [];
        for (let i = 0; i < this.currentCoords.length; i++) {
            for (let j = i + 1; j < this.currentCoords.length; j++) {
                const p = this.currentCoords[i];
                const q = this.currentCoords[j];
                if (
                    p.toString() !== q.toString() &&
                    tileAt(p, this.gameId).attr("type") === tileAt(q, this.gameId).attr("type") &&
                    isOpen(p, this.currentCoords) &&
                    isOpen(q, this.currentCoords)
                ) {
                    moves.push([p, q]);
                }
            }
        }
        
        // Update leader indicator based on current scores
        this.updateLeaderIndicator();
        
        if (moves.length === 0 && this.currentCoords.length > 0) {
            this.isActive = false;
            writeStatus("No moves left!", this.playerNumber);
            
            // Check if both games are stuck
            if (game1.isActive === false && game2.isActive === false) {
                writeStatus("Both players are stuck. Game over! 🚧");
                
                // Show tie/stuck screen after a brief delay
                await sleep(1000);
                gameOutcome.show("stuck", scoreSystem.scores);
            } 
            // If only the player is stuck, show the lose screen
            else if (this.playerNumber === 1) {
                await sleep(1000);
                gameOutcome.show("lose", scoreSystem.scores);
            }
            // If only the AI is stuck, show the win screen
            else if (this.playerNumber === 2) {
                await sleep(1000);
                gameOutcome.show("win", scoreSystem.scores);
            }
        } else {
            writeStatus(`${moves.length} moves available`, this.playerNumber);
        }
        
        if (moves.length > 0) this.hintCoord = randEl(randEl(moves));
    }
    
    // Update the leader indicator based on current scores
    updateLeaderIndicator() {
        const leader = scoreSystem.getCurrentLeader();
        
        // Remove all leader classes
        $(".player-label").removeClass("leading tied");
        
        if (leader === 0) {
            // It's a tie
            $(".player-label").addClass("tied");
        } else {
            // Mark the leader
            $(`.player-label:eq(${leader - 1})`).addClass("leading");
        }
    }
    
    async makeAIMove() {
        if (this.isAI && this.isActive && this.ai) {
            await this.ai.makeMove();
        }
    }
    
    async restart() {
        this.selectedCoord = null;
        this.hintCoord = null;
        this.currentCoords = [...COORDINATES];
        this.isActive = true;
        for (let counter = 0; counter < COORDINATES.length; counter++) {
            const coord = COORDINATES[counter];
            const image = images[counter];
            tileAt(coord, this.gameId).show().css("opacity", 1).attr("type", image.attr("type"));
            tileFrontAt(coord, this.gameId).removeClass("selectedTile").html("").append(image.clone());
        }
        await this.checkMovePossible();
    }
}

let game1, game2;

// Function to change difficulty and update the board
async function changeDifficulty(difficulty) {
    currentDifficulty = difficulty;
    
    // Update coordinates based on difficulty
    updateCoordinates(difficulty);
    
    // Update AI difficulty
    if (game2) {
        game2.ai = createAI(game2, difficulty);
    }
    
    await restartGame();
    
    // Update visual indicator of difficulty level
    $(".difficulty-badge").remove();
    $("header").append(`<div class="difficulty-badge">${difficulty} Mode</div>`);
}

// Function to restart the game
async function restartGame() {
    $("#game1, #game2").animate({ opacity: 0 }, "fast");
    
    // Clear existing tiles
    $("#game1 .tile, #game2 .tile").remove();
    
    await sleep(200);
    
    // Shuffle images for new layout
    // We need to limit the images to match the number of coordinates
    shuffle(images);
    const neededImages = images.slice(0, COORDINATES.length);
    
    // Reset scores
    scoreSystem.reset();
    
    // Re-create both games with the new layout
    game1 = new GameInstance("game1", 1);
    game2 = new GameInstance("game2", 2);
    
    // Create tiles for both games with the new layout
    createTiles({ clickFunction: (coord) => game1.clickTileAt(coord) }, "game1");
    createTiles({ clickFunction: () => {} }, "game2"); // AI game doesn't need click handlers
    
    // Initialize both games
    await game1.checkMovePossible();
    await game2.checkMovePossible();
    
    $("#game1, #game2").animate({ opacity: 1 }, "fast");
    
    // Let AI make first move after restart (randomly decide who goes first)
    if (Math.random() > 0.5) {
        await sleep(500);
        await game2.makeAIMove();
    }
}

$(document).ready(async () => {
    // Initial shuffling of all images
    shuffle(images);
    
    // Start with medium difficulty
    updateCoordinates("Medium");
    
    // Add score displays to player labels
    addScoreDisplays();
    
    // Add difficulty badge to header
    $("header").append('<div class="difficulty-badge">Medium Mode</div>');
    
    // Initialize both game instances
    game1 = new GameInstance("game1", 1);
    game2 = new GameInstance("game2", 2);
    
    // Create tiles for both games
    createTiles({ clickFunction: (coord) => game1.clickTileAt(coord) }, "game1");
    createTiles({ clickFunction: () => {} }, "game2"); // AI game doesn't need click handlers
    
    // Initialize both games
    await game1.checkMovePossible();
    await game2.checkMovePossible();
    
    $("#game1, #game2").animate({ opacity: 1 }, "slow");
    
    // Add buttons to change difficulty
    addDifficultyControls();
    
    // Initialize scores
    scoreSystem.updateScoreDisplay();
});

function addScoreDisplays() {
    // Add score elements to player labels
    $(".player-label").append('<div class="player-score"><span id="score1">Score: 0</span></div>');
    $(".player-label:eq(1)").find(".player-score").html('<span id="score2">Score: 0</span>');
    
    // Add player numbers to make it clearer
    $(".player-label:eq(0)").prepend("🧑 ");
    $(".player-label:eq(1)").prepend("🤖 ");
}

function addDifficultyControls() {
    // Add difficulty selector to the footer
    const difficultyControls = `
        <div class="difficulty-controls">
            <span>AI Level: </span>
            <select id="difficultySelect">
                <option value="Easy">Easy</option>
                <option value="Medium" selected>Medium</option>
                <option value="Hard">Hard</option>
            </select>
        </div>
    `;
    
    $("#controls").prepend($(difficultyControls));
    
    // Handle difficulty change
    $("#difficultySelect").change(function() {
        const difficulty = $(this).val();
        changeDifficulty(difficulty);
        writeStatus(`Difficulty set to ${difficulty}`, 0);
    });
}

$("#restartButton").click(() => {
    restartGame();
});

$("#hintButton1").click(() => {
    if (!game1.hintCoord || !game1.isActive) return;
    
    let toggleNumber = 6;
    let toggleDelay = 200;
    for (let i = 0; i < toggleNumber; i++) {
        setTimeout(() => {
            tileFrontAt(game1.hintCoord, game1.gameId).toggleClass("alertTile");
        }, toggleDelay * i);
    }
    setTimeout(() => {
        game1.selectTileAt(game1.hintCoord);
    }, toggleDelay * toggleNumber);
});