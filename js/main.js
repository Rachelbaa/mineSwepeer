'use strict'
// console.log('mineSwepeer');
const BOMB = '💣';
const FLAG = '🏴‍☠️';
const LIFE = '🤍';
const SMILE = '😛';
const WIN = '😎';
const LOSE = '😩';
var clickCount = 3;
var lifecount;
var gBoard;
var gGame;
var gLevel;
var elStopper;
var stopTime;
var lastKey;
var elLife = document.querySelector('.life span');
var elSmiley = document.querySelector('.smiley');
var elClicked = document.querySelector('.countClick span')
elClicked.innerText =  clickCount;


const noRightClick = document.querySelector('.game-board');
noRightClick.addEventListener('contextmenu', e => {
    e.preventDefault()
    cellMarked(e)
});

function initGame(size, mine, level) {
    clickCount = 3;
    elClicked.innerText =  clickCount;
    lifecount = 3;
    elLife.innerHTML = LIFE + LIFE + LIFE;
    elSmiley.innerText = SMILE;
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gLevel = {
        SIZE: size,
        MINES: mine,
        LEVEL : level
    };
    gBoard = buildBoard();
    renderBoard(gBoard);
}

function buildBoard() {
    var board = createMat(gLevel.SIZE, gLevel.SIZE);
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var piece = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = piece;
        }
    }
    return board
}

function createMines(board, cellLocation) {
    var mine;
    var i = gLevel.MINES
    while (i>0) {
       mine = board[getRandomIntegerD(0,gLevel.SIZE-1)][getRandomIntegerD(0,gLevel.SIZE-1)];
       if (mine[0]!==cellLocation.i && mine[1]!==cellLocation.j) {
           if (mine.isMine===false) {
             mine.isMine= true
             i--
           }    
       }
    }
}

function setMinesNegsCount(board) {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            board[i][j].minesAroundCount = findNeighbors(i, j)
        }
    }
}


function renderBoard(board) {
    var strHtml = '';
    for (var i = 0; i < board.length; i++) {
        strHtml += '<tr>';
        for (var j = 0; j < board[i].length; j++) {
            var cell = '';
            var tdId = 'cell-' + i + '-' + j;
            strHtml += '<td id="' + tdId + '" onclick="cellClicked(this)" ' +
            'class="cellB">' + cell + '</td>';
        }
        strHtml += '</tr>';
    }
    var elMat = document.querySelector('.game-board');
    elMat.innerHTML = strHtml;
}

function cellClicked(elCell) {
    gGame.isOn = true;
    var cellLocation = getCellCoord(elCell.id);
    var currentCell = gBoard[cellLocation.i][cellLocation.j];
    if (currentCell.isMarked === true) return;
    if (currentCell.isShown) return;
    currentCell.isShown = true
    gGame.shownCount += 1;
    if (gGame.shownCount === 1) {
        elCell.classList.add('selected');
        stopWatch(); 
        createMines(gBoard, cellLocation);
        setMinesNegsCount(gBoard);
        console.table(gBoard);
        return;
    } 
    elCell.classList.add('selected');
    if (currentCell.isMine === true) {
        var audio = new Audio('/sound/explosion.wav');
			audio.play();
        goingCrazy(cellLocation)
        lifecount--
        elLife.innerHTML = '';
        for (var i=0 ; i<lifecount ; i++) {
            elLife.innerHTML += LIFE; 
        }
        // renderCell(cellLocation, BOMB)
        gGame.shownCount -= 1
        currentCell.isShown = false;
        elCell.classList.remove('selected');
        setTimeout (renderCell(cellLocation, ''),3000)
        if (lifecount===0) {
            gameOver(elCell)
        }
    }else if (currentCell.minesAroundCount > 0) {
        currentCell = currentCell.minesAroundCount
        renderCell(cellLocation, currentCell)
    } else {
        currentCell = '';
        expandShown(cellLocation)
    }
    checkGameOver()
}

function expandShown(cellL) {
    for (var i = cellL.i - 1; i <= cellL.i + 1; i++) {
        if (i < 0 || i > gLevel.SIZE - 1) continue
        for (var j = cellL.j - 1; j <= cellL.j + 1; j++) {
            if (j < 0 || j > gLevel.SIZE - 1) continue
            if (i === cellL.i && j === cellL.j) continue
            if (gBoard[i][j].isMine) continue 
            if (gBoard[i][j].isShown === false) {
                gGame.shownCount += 1;
                gBoard[i][j].isShown === true
                var elNegCell = document.getElementById(`cell-${i}-${j}`)
                elNegCell.classList.add('selected');
                if (gBoard[i][j].minesAroundCount > 0) {
                    gBoard[i][j] = gBoard[i][j].minesAroundCount
                    renderCell({ i: i, j: j }, gBoard[i][j])
                }
                if (gBoard[i][j].minesAroundCount === 0) {
                    gBoard[i][j] = '';
                    expandShown({i: i, j: j});
                }
            }
        }
    }
}

function cellMarked(e) {
    var flagLocation = getCellCoord(e.target.id)
    var flagCell = gBoard[flagLocation.i][flagLocation.j]
    if (flagCell.isMarked === false) {
        flagCell.isMarked = true;
        renderCell(flagLocation, FLAG);
        gGame.markedCount += 1;
    } else {
        flagCell.isMarked = false;
        renderCell(flagLocation, '');
        gGame.markedCount -= 1;
    }
    if (gGame.markedCount===1 && gGame.shownCount===0) {
        gGame.isOn = true;
        stopWatch();
    } 
    checkGameOver()
}

function safeClick() {
    if (!gGame.isOn) return;
    if (clickCount===0) return;
    clickCount--
    elClicked.innerText =  clickCount;
    var safeCell;
    var locationCell;
    var forRutin =0
    var i = 1;
    while (i>0) {
        locationCell = {i :getRandomIntegerD(0,gLevel.SIZE-1), j:getRandomIntegerD(0,gLevel.SIZE-1)}
        safeCell= gBoard[locationCell.i][locationCell.j];
        var elCell = document.getElementById(`cell-${locationCell.i}-${locationCell.j}`)
        if (!safeCell.isMine && !safeCell.isShown) {
            if (safeCell.minesAroundCount===0) {
                elCell.classList.add('revilee')
                setTimeout(() => {
                    elCell.classList.remove('revilee')
             }, 400);
             i--   
            }
        }
        if (forRutin === gLevel.SIZE*10) {
            i--
        }
        forRutin++ 
    }

}

function stopWatch() {
    var min = 0
    var sec = 0
    var milisec = 0
    elStopper = document.querySelector('.stop-watch')
    var stoper = setInterval(() => {
        if (milisec === 990) {
            sec += 1
            milisec = 0
        }
        if (sec === 60) {
            min += 1
            sec = 0
        }
        if (gGame.isOn === false) {
            clearInterval(stoper)
        }
        milisec += 10
        elStopper.innerText = min + ':' + sec + ':' + milisec;
        gGame.secsPassed = min + ':' + sec + ':' + milisec;
        stopTime = {min: min, sec: sec, milisec: milisec};
    }, 10)
}

function goingCrazy(cellLocation) {
    var elCell = document.getElementById(`cell-${cellLocation.i}-${cellLocation.j}`)
    var elWB = document.querySelector('.black-white');
    var stop = 0
    elWB.style.opacity = '0.7';
    elWB.style.zIndex ='2';
    var crazy = setInterval(() => {
        renderCell(cellLocation, BOMB);
        setTimeout(() => {
            elWB.style.backgroundColor = 'white';  
            elCell.style.backgroundColor = 'red'; 
        }, 150); 
        setTimeout(() => {
            elWB.style.backgroundColor = 'black';  
            elCell.style.backgroundColor = 'rgb(126, 126, 126)'; 
        }, 300); 
        if (stop===2) {
            clearInterval(crazy); 
            elWB.style.opacity = '0'; 
            elWB.style.zIndex ='-1';
            renderCell(cellLocation, '');
        }
        stop++
    }, 400);
}



function gameOver(elCell) {
    gGame.isOn = false;
    elCell.classList.add('lost');
    for (var i=0 ; i<gLevel.SIZE ; i++) {
        for (var j=0 ; j<gLevel.SIZE ; j++) {
            if (gBoard[i][j].isMine) {
                renderCell({i: i, j: j}, BOMB) 
            }
        }
    }
    elSmiley.innerText = LOSE;
    var noClick = document.querySelectorAll('.cellB');
    // console.log(noClick,'112233');
    for (var i=0 ; i<noClick.length ; i++) {
        noClick[i].onclick = function() {
            return false;
        }
    }
    alert('Game over!! U lost!');
}


function checkGameOver() {
    var countedCells = Math.pow(gLevel.SIZE, 2) - gLevel.MINES
    var countedMines = 0;
    for (var i=0 ; i<gLevel.SIZE ; i++) {
        for (var j=0 ; j<gLevel.SIZE ; j++) {
          if (gBoard[i][j].isMine===true && gBoard[i][j].isMarked===true) countedMines++
        }
    }
    if (countedMines === gLevel.MINES && countedCells === gGame.shownCount) {
        gGame.isOn = false
        elSmiley.innerText = WIN;
        setBestScore()
        // console.log(stopTime,'stop time is :');
        alert('Good Job!!!');
    }
}

function restartGame() {
    elStopper.innerText = ' 00:00:000 ';
    initGame(gLevel.SIZE, gLevel.MINES, gLevel.LEVEL);
}


function setBestScore() {
// debugger
var stopTimeStr = JSON.stringify(stopTime);
console.log(stopTimeStr,'4444');
var elBestS = document.querySelector(`.time${gLevel.LEVEL}`);
    if (typeof(Storage) !== "undefined") {
        if (gLevel.LEVEL===1 && localStorage.bestScore1 ) {
            var storageTime = JSON.parse(localStorage.getItem(`bestScore1`))
            if (storageTime.min > stopTime.min) {
                storageTime = stopTimeStr;
                localStorage.bestScore1 = stopTimeStr;
                elBestS.innerHTML = gGame.secsPassed
                return;
            }else if (storageTime.sec > stopTime.sec) {
                storageTime = stopTimeStr;
                localStorage.bestScore1 = stopTimeStr;
                elBestS.innerHTML = gGame.secsPassed
                return;
            }else if (storageTime.milisec > stopTime.milisec) {
                storageTime = stopTimeStr;
                localStorage.bestScore1 = stopTimeStr;
                elBestS.innerHTML = gGame.secsPassed
                return;
            } else return;
        }else {
            localStorage.setItem( 'bestScore1' , stopTime);
            elBestS.innerHTML = gGame.secsPassed;
        }

        if (gLevel.LEVEL===2 && localStorage.bestScore2 ) {
            var storageTime = JSON.parse(localStorage.getItem(`bestScore2`))
            if (storageTime.min > stopTime.min) {
                storageTime = stopTimeStr;
                localStorage.bestScore2 = stopTimeStr;
                elBestS.innerHTML = gGame.secsPassed
                return;
            }else if (storageTime.sec > stopTime.sec) {
                storageTime = stopTimeStr;
                localStorage.bestScore2 = stopTimeStr;
                elBestS.innerHTML = gGame.secsPassed
                return;
            }else if (storageTime.milisec > stopTime.milisec) {
                storageTime = stopTimeStr;
                localStorage.bestScore2 = stopTimeStr;
                elBestS.innerHTML = gGame.secsPassed
                return;
            } else return;
        }else {
            localStorage.setItem( 'bestScore2', stopTime);
            elBestS.innerHTML = gGame.secsPassed;
        }

        if (gLevel.LEVEL===3 && localStorage.bestScore3 ) {
            var storageTime = JSON.parse(localStorage.getItem(`bestScore3`))
            if (storageTime.min > stopTime.min) {
                storageTime = stopTimeStr;
                localStorage.bestScore3 = stopTimeStr;
                elBestS.innerHTML = gGame.secsPassed
                return;
            }else if (storageTime.sec > stopTime.sec) {
                storageTime = stopTimeStr;
                localStorage.bestScore3 = stopTimeStr;
                elBestS.innerHTML = gGame.secsPassed
                return;
            }else if (storageTime.milisec > stopTime.milisec) {
                storageTime = stopTimeStr;
                localStorage.bestScore3 = stopTimeStr;
                elBestS.innerHTML = gGame.secsPassed
                return;
            } else return;
        }else {
            localStorage.setItem( 'bestScore3', stopTime);
            elBestS.innerHTML = gGame.secsPassed;
        }
    }
}
