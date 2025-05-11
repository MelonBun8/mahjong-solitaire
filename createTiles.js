import { COORDINATES } from "./coordinates.js";
import { TILE_WIDTH, TILE_HEIGHT, images } from "./images.js";

const TILE_DEPTH = 7;
const TILE_ROUNDNESS = 7;
const VERTICAL_OFFSET = 40; // Space from top of container

export function createTiles(options, gameId = "game") {
    // Get the required number of images based on coordinates length
    const requiredImages = images.slice(0, COORDINATES.length);
    
    // Calculate maximum x coordinate to determine center offset
    const maxX = Math.max(...COORDINATES.map(coord => coord[0]));
    const minX = Math.min(...COORDINATES.map(coord => coord[0]));
    const containerWidth = $(`#${gameId}`).width();
    
    // Dynamically adjust horizontal offset based on layout size
    const layoutWidth = (maxX - minX) * TILE_WIDTH;
    const HORIZONTAL_OFFSET = (containerWidth - layoutWidth - (TILE_DEPTH * 4)) / 2;

    for (let counter = 0; counter < COORDINATES.length; counter++) {
        const coord = COORDINATES[counter];
        const [x, y, z] = coord;
        
        // Make sure we don't exceed the image array bounds
        const imageIndex = counter % requiredImages.length;
        const image = requiredImages[imageIndex];

        const tile = $("<div></div>")
            .addClass("tile")
            .css({
                left: (x * TILE_WIDTH + TILE_DEPTH * z + HORIZONTAL_OFFSET) + "px",
                top: (y * TILE_HEIGHT + TILE_DEPTH * z + VERTICAL_OFFSET) + "px",
                zIndex: z,
            })
            .attr("coord", coord.toString())
            .attr("type", image.attr("type"))
            .attr("game-id", gameId);

        const tileFront = $("<div></div>")
            .addClass("tileFront")
            .css({
                width: TILE_WIDTH + "px",
                height: TILE_HEIGHT + "px",
                borderRadius: TILE_ROUNDNESS + "px",
            })
            .attr("coord", coord.toString())
            .attr("game-id", gameId)
            .click(() => {
                options.clickFunction(coord);
            })
            .append(image.clone());

        const tileBack = $("<div></div>")
            .addClass("tileBack")
            .css({
                width: TILE_WIDTH + TILE_DEPTH + "px",
                height: TILE_HEIGHT + TILE_DEPTH + "px",
                top: -TILE_DEPTH + "px",
                left: -TILE_DEPTH + "px",
                borderRadius: `
                    ${TILE_ROUNDNESS}px
                    ${2 * TILE_DEPTH}px
                    ${TILE_ROUNDNESS}px
                    ${2 * TILE_DEPTH}px`,
            })
            .attr("game-id", gameId);

        tile.append(tileBack).append(tileFront).appendTo(`#${gameId}`);
    }
}