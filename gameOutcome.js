// gameOutcome.js

export class GameOutcome {
    constructor() {
        this.setupOutcomeScreens();
    }
    
    setupOutcomeScreens() {
        // Create and append outcome overlay to the document
        const outcomeHTML = `
            <div id="game-outcome-overlay" style="display: none;">
                <div id="game-outcome-container">
                    <div id="outcome-message"></div>
                    <div id="outcome-scores">
                        <div id="outcome-player1" class="outcome-player-score">
                            <div class="outcome-player-label">Player 1</div>
                            <div class="outcome-player-points"></div>
                        </div>
                        <div id="outcome-player2" class="outcome-player-score">
                            <div class="outcome-player-label">Player 2 (Bot)</div>
                            <div class="outcome-player-points"></div>
                        </div>
                    </div>
                    <button id="play-again-button">Play Again</button>
                </div>
            </div>
        `;
        
        $("body").append(outcomeHTML);
        
        // Add event listener for play again button
        $("#play-again-button").click(() => {
            this.hide();
            // Trigger restart button click
            $("#restartButton").click();
        });
    }
    
    show(outcome, scores) {
        // Set outcome message
        let message = "";
        let player1Class = "";
        let player2Class = "";
        
        if (outcome === "win") {
            message = "You Win! 🎉";
            player1Class = "winner";
            player2Class = "loser";
        } else if (outcome === "lose") {
            message = "You Lose! 😢";
            player1Class = "loser";
            player2Class = "winner";
        } else if (outcome === "tie") {
            message = "It's a Tie! 🤝";
        } else if (outcome === "stuck") {
            message = "Both Players Stuck! Game Over";
        }
        
        $("#outcome-message").text(message);
        
        // Set scores
        $("#outcome-player1 .outcome-player-points").text(`Score: ${scores[1]}`);
        $("#outcome-player2 .outcome-player-points").text(`Score: ${scores[2]}`);
        
        // Apply winner/loser classes
        $("#outcome-player1").removeClass("winner loser").addClass(player1Class);
        $("#outcome-player2").removeClass("winner loser").addClass(player2Class);
        
        // Show overlay with animation
        $("#game-outcome-overlay").fadeIn(300);
    }
    
    hide() {
        $("#game-outcome-overlay").fadeOut(200);
    }
}