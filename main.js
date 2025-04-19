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
import { isOpen, COORDINATES } from "./coordinates.js";
import {} from "./infoText.js";
import { createAI } from "./mahjongAI.js";

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
            this.ai = createAI(this, "Medium");
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
                    this.executeMove(tile, selectedTile, coord, this.selectedCoord);
                    return;
                }
            }
        }
        this.selectTileAt(coord);
    }

    async executeMove(tile, selectedTile, coord, coord2) { 
        this.selectedCoord = null;
        this.hintCoord = null;
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
                } else {
                    game1.isActive = false;
                    writeStatus("Player 2 won!", 1);
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
        if (moves.length === 0 && this.currentCoords.length > 0) {
            this.isActive = false;
            writeStatus("No moves left!", this.playerNumber);
            if (game1.isActive === false && game2.isActive === false) {
                writeStatus("Both players are stuck. Game over! 🚧");
            }
        } else {
            writeStatus(`${moves.length} moves available`, this.playerNumber);
        }
        if (moves.length > 0) this.hintCoord = randEl(randEl(moves));
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

$(document).ready(async () => {
    shuffle(images);
    
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
});

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
        game2.ai = createAI(game2, difficulty);
        writeStatus(`AI set to ${difficulty} level`, 2);
    });
}

$("#restartButton").click(async () => {
    $("#game1, #game2").animate({ opacity: 0 }, "fast");
    await sleep(200);
    shuffle(images);
    await game1.restart();
    await game2.restart();
    $("#game1, #game2").animate({ opacity: 1 }, "fast");
    
    // Let AI make first move after restart (randomly decide who goes first)
    if (Math.random() > 0.5) {
        await sleep(500);
        await game2.makeAIMove();
    }
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