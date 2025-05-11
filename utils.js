export function shuffle(list) { 
    for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
    }
}

export function interval(a, b, mapfunction) {
    if (mapfunction)
        return new Array(b - a + 1).fill(0).map((el, index) => mapfunction(a + index));
    return new Array(b - a + 1).fill(0).map((el, index) => a + index);
}

export function matrixInterval(a, b, c, d, mapfunction) {
    return interval(c, d, (y) => interval(a, b, (x) => mapfunction(x, y))).flat(1);
}

export function disjoint(list1, list2) {
    return list1.every((a) => list2.every((b) => a.toString() != b.toString()));
}

export function remove(element, list) {
    const i = list.findIndex((search) => search.toString() == element.toString());
    list.splice(i, 1);
}

export function randEl(list) {
    const index = Math.floor(Math.random() * list.length);
    return list[index];
}

export function sleep(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function writeStatus(txt, player = 0) {
    if (player === 1) {
        $("#statusText1").html(txt);
    } else if (player === 2) {
        $("#statusText2").html(txt);
    } else {
        $("#statusText1, #statusText2").html(txt);
    }
}

export function tileAt(coord, gameId = "game") {
    return $(`.tile[coord="${coord.toString()}"][game-id="${gameId}"]`);
}

export function tileFrontAt(coord, gameId = "game") {
    return $(`.tileFront[coord="${coord.toString()}"][game-id="${gameId}"]`);
}