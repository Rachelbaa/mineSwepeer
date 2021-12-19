function createMat(ROWS, COLS) {
    var mat = []
    for (var i = 0; i < ROWS; i++) {
        var row = []
        for (var j = 0; j < COLS; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}

function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
    return array;
}

function getRandomIntegerD(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function findNeighbors(rowIdx, colIdx) {
    var neighborCount = 0;
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i > gLevel.SIZE - 1) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j > gLevel.SIZE - 1) continue
            if (i === rowIdx && j === colIdx) continue
            if (gBoard[i][j].isMine === true) neighborCount++
        }
    }
    return neighborCount
}

function getSelector(coord) {
    return '#cell-' + coord.i + '-' + coord.j
}

function getCellCoord(strCellId) {
    var coord = {};
    coord.i = +strCellId.substring(5, strCellId.lastIndexOf('-'));
    coord.j = +strCellId.substring(strCellId.lastIndexOf('-') + 1);
    return coord;
}

function renderCell(location, value) {
    var cellSelector = getSelector(location)
    var elCelll = document.querySelector(cellSelector);
    elCelll.innerHTML = value;
}

