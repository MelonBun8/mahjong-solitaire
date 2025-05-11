// layouts.js
import { interval, matrixInterval } from "./utils.js";

// EASY LAYOUT - Smaller pyramid with fewer layers (about 60%)
const easyLevel0 = [
    ...interval(3, 10, (x) => [x, 0, 0]),
    ...interval(4, 9, (x) => [x, 1, 0]),
    ...interval(3, 10, (x) => [x, 2, 0]),
    ...interval(4, 9, (x) => [x, 3, 0]),
    ...interval(3, 10, (x) => [x, 4, 0]),
].reverse();

const easyLevel1 = matrixInterval(4, 9, 1, 3, (x, y) => [x, y, 1]).reverse();
const easyLevel2 = matrixInterval(5, 8, 2, 2, (x, y) => [x, y, 2]).reverse();
const easyLevel3 = [[6.5, 2, 3]];

export const EASY_COORDINATES = [...easyLevel0, ...easyLevel1, ...easyLevel2, ...easyLevel3];

// MEDIUM LAYOUT - Moderate size (about 80%)
const mediumLevel0 = [
    ...interval(2, 11, (x) => [x, 0, 0]),
    ...interval(3, 10, (x) => [x, 1, 0]),
    ...interval(2, 11, (x) => [x, 2, 0]),
    [1, 3.5, 0],
    ...interval(2, 11, (x) => [x, 3, 0]),
    ...interval(2, 11, (x) => [x, 4, 0]),
    [12, 3.5, 0],
    ...interval(2, 11, (x) => [x, 5, 0]),
    ...interval(3, 10, (x) => [x, 6, 0]),
].reverse();

const mediumLevel1 = matrixInterval(4, 9, 1, 5, (x, y) => [x, y, 1]).reverse();
const mediumLevel2 = matrixInterval(5, 8, 2, 4, (x, y) => [x, y, 2]).reverse();
const mediumLevel3 = matrixInterval(6, 7, 3, 3, (x, y) => [x, y, 3]).reverse();
const mediumLevel4 = [[6.5, 3, 4]];

export const MEDIUM_COORDINATES = [...mediumLevel0, ...mediumLevel1, ...mediumLevel2, ...mediumLevel3, ...mediumLevel4];

// HARD LAYOUT - Full size (original layout)
const hardLevel0 = [
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

const hardLevel1 = matrixInterval(4, 9, 1, 6, (x, y) => [x, y, 1]).reverse();
const hardLevel2 = matrixInterval(5, 8, 2, 5, (x, y) => [x, y, 2]).reverse();
const hardLevel3 = matrixInterval(6, 7, 3, 4, (x, y) => [x, y, 3]).reverse();
const hardLevel4 = [[6.5, 3.5, 4]];

export const HARD_COORDINATES = [...hardLevel0, ...hardLevel1, ...hardLevel2, ...hardLevel3, ...hardLevel4];

// Get coordinates based on difficulty level
export function getCoordinatesByDifficulty(difficulty) {
    switch(difficulty) {
        case "Easy":
            return EASY_COORDINATES;
        case "Medium":
            return MEDIUM_COORDINATES;
        case "Hard":
            return HARD_COORDINATES;
        default:
            return MEDIUM_COORDINATES;
    }
}