import { disjoint, interval, matrixInterval } from "./utils.js";

const level0 = [ // lowest level has 8 rows (shown by 2nd element in coordinate list (the anon function passed in interval), 1st shows x coordinate)
    ...interval(1, 12, (x) => [x, 0, 0]),
    ...interval(3, 10, (x) => [x, 1, 0]),
    ...interval(2, 11, (x) => [x, 2, 0]),
    [0, 3.5, 0],
    ...interval(1, 12, (x) => [x, 3, 0]),
    ...interval(1, 12, (x) => [x, 4, 0]),
    [13, 3.5, 0],
    ...interval(2, 11, (x) => [x, 5, 0]),
    ...interval(3, 10, (x) => [x, 6, 0]),
    ...interval(1, 12, (x) => [x, 7, 0]),
].reverse();

const level1 = matrixInterval(4, 9, 1, 6, (x, y) => [x, y, 1]).reverse();
const level2 = matrixInterval(5, 8, 2, 5, (x, y) => [x, y, 2]).reverse();
const level3 = matrixInterval(6, 7, 3, 4, (x, y) => [x, y, 3]).reverse();
const level4 = [[6.5, 3.5, 4]];

export const COORDINATES = [...level0, ...level1, ...level2, ...level3, ...level4]; // basically it dynamically and efficiently creates a 2d array of coordinates

function leftNeighbors(coord) {
    if (
        coord.toString() === [1, 3, 0].toString() ||
        coord.toString() === [1, 4, 0].toString()
    ) {
        return [[0, 3.5, 0]];
    }
    if (coord.toString() === [13, 3.5, 0].toString()) {
        return [
            [12, 3, 0],
            [12, 4, 0],
        ];
    }
    const [x, y, z] = coord;
    return [[x - 1, y, z]];
}

function rightNeighbors(coord) {
    if (coord.toString() === [0, 3.5, 0].toString()) {
        return [
            [1, 3, 0],
            [1, 4, 0],
        ];
    }
    if (
        coord.toString() === [12, 3, 0].toString() ||
        coord.toString() === [12, 4, 0].toString()
    ) {
        return [[13, 3.5, 0]];
    } // above 2 if statements cover the special cases for the leftmost middle tile and tiles to the left of the rightmost middle tile
    const [x, y, z] = coord;
    return [[x + 1, y, z]]; // otherwise return the right neighbor's coordinates (to x+1 postion)
}

export function isOpen(coord, currentCoords) { // checks if A tile is open
    if (disjoint([coord], currentCoords)) return false; // checking if it's not one of the current coordinates (already cleared)
    const [x, y, z] = coord;
    if (
        currentCoords.some(([a, b, c]) => a === x && b === y && c > z) ||
        (z === 3 && currentCoords.some(([a, b, c]) => c === 4))
    ) { // if any tile stacked DIRECTLY above it OR it's the 2nd layer (the first layer's tile is in the center and won't be detected), NOT OPEN
        return false;
    }
    return (
        disjoint(leftNeighbors(coord), currentCoords) ||
        disjoint(rightNeighbors(coord), currentCoords) // IF it has no neighbors on the left OR no neighbors on the right, it's open!
    );
}
