import { disjoint, interval, matrixInterval } from "./utils.js";
import { getCoordinatesByDifficulty, MEDIUM_COORDINATES } from "./layouts.js";

// Default to medium layout
export let COORDINATES = [...MEDIUM_COORDINATES];

// Function to update coordinates based on difficulty
export function updateCoordinates(difficulty) {
    COORDINATES = getCoordinatesByDifficulty(difficulty);
    return COORDINATES;
}

function leftNeighbors(coord) {
    // Handle special cases for different layouts
    const [x, y, z] = coord;
    
    // Easy layout special cases
    if (COORDINATES === getCoordinatesByDifficulty("Easy")) {
        // No special cases for easy layout
        return [[x - 1, y, z]];
    }
    
    // Medium layout special cases
    if (COORDINATES === getCoordinatesByDifficulty("Medium")) {
        if (coord.toString() === [1, 3.5, 0].toString()) {
            return [];
        }
        if (coord.toString() === [2, 3, 0].toString() || 
            coord.toString() === [2, 4, 0].toString()) {
            return [[1, 3.5, 0]];
        }
        if (coord.toString() === [12, 3.5, 0].toString()) {
            return [[11, 3, 0], [11, 4, 0]];
        }
    }
    
    // Hard layout (original) special cases
    if (COORDINATES === getCoordinatesByDifficulty("Hard")) {
        if (coord.toString() === [1, 3, 0].toString() ||
            coord.toString() === [1, 4, 0].toString()) {
            return [[0, 3.5, 0]];
        }
        if (coord.toString() === [13, 3.5, 0].toString()) {
            return [[12, 3, 0], [12, 4, 0]];
        }
    }
    
    return [[x - 1, y, z]];
}

function rightNeighbors(coord) {
    // Handle special cases for different layouts
    const [x, y, z] = coord;
    
    // Easy layout special cases
    if (COORDINATES === getCoordinatesByDifficulty("Easy")) {
        // No special cases for easy layout
        return [[x + 1, y, z]];
    }
    
    // Medium layout special cases
    if (COORDINATES === getCoordinatesByDifficulty("Medium")) {
        if (coord.toString() === [1, 3.5, 0].toString()) {
            return [[2, 3, 0], [2, 4, 0]];
        }
        if (coord.toString() === [11, 3, 0].toString() ||
            coord.toString() === [11, 4, 0].toString()) {
            return [[12, 3.5, 0]];
        }
    }
    
    // Hard layout (original) special cases
    if (COORDINATES === getCoordinatesByDifficulty("Hard")) {
        if (coord.toString() === [0, 3.5, 0].toString()) {
            return [[1, 3, 0], [1, 4, 0]];
        }
        if (coord.toString() === [12, 3, 0].toString() ||
            coord.toString() === [12, 4, 0].toString()) {
            return [[13, 3.5, 0]];
        }
    }
    
    return [[x + 1, y, z]];
}

export function isOpen(coord, currentCoords) {
    if (disjoint([coord], currentCoords)) return false;
    const [x, y, z] = coord;
    if (
        currentCoords.some(([a, b, c]) => a === x && b === y && c > z) ||
        (z === 3 && currentCoords.some(([a, b, c]) => c === 4))
    ) {
        return false;
    }
    return (
        disjoint(leftNeighbors(coord), currentCoords) ||
        disjoint(rightNeighbors(coord), currentCoords)
    );
}