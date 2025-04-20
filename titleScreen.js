// Create a new file called titleScreen.js

// Title screen module for Fast Mahjong Solitaire
export class TitleScreen {
    constructor() {
        this.container = null;
        this.isVisible = true;
    }
    
    // Create and display the title screen
    initialize() {
        // Create container if it doesn't exist
        if (!this.container) {
            this.createTitleScreen();
        }
        
        // Show the title screen
        this.show();
        
        // Attach event listener to start button
        $("#startButton").on("click", () => this.startGame());
    }
    
    // Create the title screen elements
    createTitleScreen() {
        // Create container
        this.container = $("<div></div>")
            .attr("id", "titleScreen")
            .css({
                "position": "fixed",
                "top": "0",
                "left": "0",
                "width": "100%",
                "height": "100%",
                "background": "linear-gradient(to bottom, #4b6cb7, #182848)",
                "z-index": "9999",
                "display": "flex",
                "flex-direction": "column",
                "justify-content": "center",
                "align-items": "center",
                "color": "white",
                "font-family": "Arial, sans-serif"
            });
            
        // Title
        const title = $("<h1></h1>")
            .text("FAST Mahjong Solitaire!")
            .css({
                "font-size": "3.5rem",
                "margin-bottom": "20px",
                "text-shadow": "2px 2px 4px rgba(0,0,0,0.5)",
                "text-align": "center"
            });
            
        // Image
        const image = $("<img>")
            .attr("src", "tiles.png")
            .attr("alt", "Mahjong Tiles")
            .css({
                "max-width": "400px",
                "max-height": "300px",
                "margin": "20px 0",
                "border-radius": "8px",
                "box-shadow": "0 10px 20px rgba(0,0,0,0.3)"
            });
            
        // Credits
        const credits = $("<p></p>")
            .html("Created By:<br>Saad Arfan - 22K4446 | Shariq Nadeem - 22K4285 | Taha Imran - 22K4283")
            .css({
                "font-size": "1.2rem",
                "margin-top": "20px",
                "margin-bottom": "30px",
                "text-align": "center",
                "line-height": "1.6"
            });
            
        // Start button
        const startButton = $("<button></button>")
            .attr("id", "startButton")
            .text("START GAME")
            .css({
                "padding": "15px 40px",
                "font-size": "1.5rem",
                "background": "#ff9900",
                "color": "white",
                "border": "none",
                "border-radius": "30px",
                "cursor": "pointer",
                "transition": "all 0.3s ease",
                "box-shadow": "0 4px 8px rgba(0,0,0,0.2)"
            });
            
        // Hover effect for button
        startButton.hover(
            function() {
                $(this).css({
                    "background": "#ffae00",
                    "transform": "scale(1.05)"
                });
            },
            function() {
                $(this).css({
                    "background": "#ff9900",
                    "transform": "scale(1)"
                });
            }
        );
        
        // Version info
        const versionInfo = $("<div></div>")
            .text("v1.0")
            .css({
                "position": "absolute",
                "bottom": "10px",
                "right": "10px",
                "font-size": "0.8rem",
                "opacity": "0.7"
            });
            
        // Append all elements to container
        this.container.append(title, image, credits, startButton, versionInfo);
        
        // Add to body
        $("body").append(this.container);
    }
    
    // Show the title screen
    show() {
        this.container.show();
        this.isVisible = true;
    }
    
    // Hide the title screen
    hide() {
        this.container.animate({ opacity: 0 }, 500, () => {
            this.container.hide();
            this.container.css("opacity", 1);
        });
        this.isVisible = false;
    }
    
    // Start the game
    startGame() {
        // Hide the title screen with animation
        this.hide();
        
        // Show the game containers with animation
        $("#game1, #game2").css("opacity", 0).show().animate({ opacity: 1 }, 800);
        $("#controls").css("opacity", 0).show().animate({ opacity: 1 }, 800);
        
        // Reset scores if needed
        scoreSystem.reset();
        
        // Trigger AI move if it should go first (random chance)
        if (Math.random() > 0.5) {
            setTimeout(() => {
                game2.makeAIMove();
            }, 1000);
        }
    }
}