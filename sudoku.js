var currCellID = "0-0"
const rowlen = 9;
const rownum = 9;
const maxSolverIterations = 100;

function getSingleIndex(i, j) {
    return i * rowlen + j;
}

function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

class Sudoku {
    constructor() {
        this.cells = new Array(rowlen * rownum);
        this.unmutableCells = new Array(rowlen * rownum);
        for (let i = 0; i < rownum; i++) {
            for (let j = 0; j < rowlen; j++) {
                this.cells[getSingleIndex(i, j)] = 0;
                this.unmutableCells[getSingleIndex(i, j)] = true;
            }
        }
    }
    static copy(sudoku) {
        let newSudoku = new Sudoku();
        for (let i = 0; i < rownum; i++) {
            for (let j = 0; j < rowlen; j++) {
                newSudoku.cells[getSingleIndex(i, j)] = sudoku.cells[getSingleIndex(i, j)];
                newSudoku.unmutableCells[getSingleIndex(i, j)] = sudoku.unmutableCells[getSingleIndex(i, j)];
            }
        }
        return newSudoku;
    }
    getCell(i, j) {
        return this.cells[getSingleIndex(i, j)];
    }
    setCell(i, j, value) {
        this.cells[getSingleIndex(i, j)] = value;
    }
    getCellFromID(cellID) {
        let [i, j] = cellID.split("-");
        return this.getCell(parseInt(i), parseInt(j));
    }
    getCellMutableFromID(cellID) {
        let [i, j] = cellID.split("-");
        return this.unmutableCells[getSingleIndex(parseInt(i), parseInt(j))];
    }

    setCellFromID(cellID, value) {
        let [i, j] = cellID.split("-");
        this.setCell(parseInt(i), parseInt(j), clamp(value, 1, 9));
    }
    updateHTML() {
        for (let i = 0; i < rownum; i++) {
            for (let j = 0; j < rowlen; j++) {
                let cell = this.getCell(i, j);
                let cellID = i + "-" + j;
                document.getElementById(cellID).innerHTML = cell;
            }
        }
    }

    

    static generateNewSudoku(clueNum) {
        let sudoku = new Sudoku();
        let clueCount = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                clueCount = 0
                while (clueCount < clueNum) {
                    let randI = Math.floor(Math.random() * 3);
                    let randJ = Math.floor(Math.random() * 3);
                    let randVal = Math.floor(Math.random() * 9) + 1;
                    if (sudoku.getCell((i*3) + randI, (j*3) + randJ) == 0) {
                        sudoku.setCell((i*3) + randI, (j*3) + randJ, randVal);
                        sudoku.unmutableCells[getSingleIndex((i*3) + randI, (j*3) + randJ)] = false;
                        clueCount++;
                    }
                }
            }
        }
        return sudoku;
    }
    

    static checkValid(nums) {
        //check all numbers are unique
        let numSet = new Set();
        for (let i = 0; i < nums.length; i++) {
            if (nums[i] == 0) {
                continue;
            }
            if (numSet.has(nums[i])) {
                return false;
            }
            numSet.add(nums[i]);
        }
        return true;
    }
    checkValidRow(i) {
        let row = new Array(9);
        for (let j = 0; j < rowlen; j++) {
            row[j] = this.getCell(i, j);
        }
        return Sudoku.checkValid(row);
    }
    checkValidColumn(j) {
        let column = new Array(9);
        for (let i = 0; i < rownum; i++) {
            column[i] = this.getCell(i, j);
        }
        return Sudoku.checkValid(column);
    }
    
    checkValidSubgrid(i, j) {
        let subgrid = new Array(9);
        let subgridIndex = 0;
        for (let k = 0; k < 3; k++) {
            for (let l = 0; l < 3; l++) {
                subgrid[subgridIndex] = this.getCell(i + k, j + l);
                subgridIndex++;
            }
        }
        return Sudoku.checkValid(subgrid);
    }
    static checkValidSudoku(sudoku) {
        for (let i = 0; i < rownum; i++) {
            if (!sudoku.checkValidRow(i)) {
                return false;
            }
        }
        for (let j = 0; j < rowlen; j++) {
            if (!sudoku.checkValidColumn(j)) {
                return false;
            }
        }
        for (let i = 0; i < rownum; i += 3) {
            for (let j = 0; j < rowlen; j += 3) {
                if (!sudoku.checkValidSubgrid(i, j)) {
                    return false;
                }
            }
        }
        return true;
    }
    static checkCompleteSudoku(sudoku) {
        let complete = true;
        for (let i = 0; i < rownum; i++) {
            for (let j = 0; j < rowlen; j++) {
                if (sudoku.getCell(i, j) == 0) {
                    complete = false;
                }
            }
        }
        return complete && Sudoku.checkValidSudoku(sudoku);
    }
    setValidPlacementCSS() {
        for (let i = 0; i < rownum; i++) {
            for (let j = 0; j < rowlen; j++) {
                let cellID = i + "-" + j;
                let cell = this.getCell(i, j);
                if (cell == 0) {
                    document.getElementById(cellID).style.backgroundColor = "OldLace";
                } else if(!this.getCellMutableFromID(cellID)) {
                    document.getElementById(cellID).style.backgroundColor = "PaleGoldenRod";
                } else if(this.checkValidRow(i) && this.checkValidColumn(j) && this.checkValidSubgrid(i - (i % 3), j - (j % 3))) {
                    document.getElementById(cellID).style.backgroundColor = "darkseagreen";
                } else {
                    document.getElementById(cellID).style.backgroundColor = "red";
                }
            }
        }
        if(currCellID != null && currCellID != undefined && this.getCellMutableFromID(currCellID)) document.getElementById(currCellID).style.backgroundColor = "orange";
        else if(currCellID != null && currCellID != undefined) document.getElementById(currCellID).style.backgroundColor = "PeachPuff";
    }

    trimToClues(clueNum) {
        var clueCount = 9;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                clueCount = 9
                while (clueCount > clueNum) {
                    let randI = Math.floor(Math.random() * 3);
                    let randJ = Math.floor(Math.random() * 3);
                    if (this.getCell((i*3) + randI, (j*3) + randJ) != 0) {
                        this.setCell((i*3) + randI, (j*3) + randJ, 0);
                        this.unmutableCells[getSingleIndex((i*3) + randI, (j*3) + randJ)] = true;
                        clueCount--;
                    }
                }
                for (let k = 0; k < 3; k++) {
                    for (let l = 0; l < 3; l++) {
                        if (this.getCell((i*3) + k, (j*3) + l) != 0) {
                            this.unmutableCells[getSingleIndex((i*3) + k, (j*3) + l)] = false;
                        }
                    }
                }
            }
        }
    }
}


var timeOut = 0
class Solver {
    static solve(sudoku, iterations) {
        if(iterations == 0) timeOut = 0
        else timeOut += 1
        if(timeOut > 2000) return false
        if(iterations > maxSolverIterations) return false;
        for (let i = 0; i < rownum; i++) {
            for (let j = 0; j < rowlen; j++) {
                if (sudoku.getCell(i, j) == 0) {
                    for (let n = 1; n <= 9; n++) {
                        sudoku.setCell(i, j, n);
                        if (sudoku.checkValidRow(i) && sudoku.checkValidColumn(j) && sudoku.checkValidSubgrid(i - (i % 3), j - (j % 3))) {
                            if (Solver.solve(sudoku, iterations++)) {
                                return true;
                            }else if(iterations > maxSolverIterations) return false;
                        }else if(iterations > maxSolverIterations) return false;
                    }
                    sudoku.setCell(i, j, 0);
                    return false;
                }
            }
        }
        return true;
    }
    updateHTML() {
        sudoku.updateHTML();
    }
}



function getDifficultyNum(difficulty) {
    if (difficulty == "Easy") return 4;
    else if (difficulty == "Medium") return 3;
    else if (difficulty == "Hard") return 2;
    else return 1;
}

function generateSudoku(difficulty) {
    let numClues = getDifficultyNum(difficulty);
    var newSudoku = Sudoku.generateNewSudoku(1);
    while(!Solver.solve(newSudoku, 0))
    {
        newSudoku = Sudoku.generateNewSudoku(1)
    }
    newSudoku.trimToClues(numClues);
    return newSudoku;
}

var difficulty = "Easy";
var sudoku = generateSudoku(difficulty);



generateSudoku(difficulty);


$(document).ready(function () {
    $("td").hover(function () {
        let cellID = $(this).attr("id");
        currCellID = cellID;
        let cell = sudoku.getCellFromID(cellID);
        sudoku.setValidPlacementCSS();
    },
        function () {
        currCellID = null;
        sudoku.setValidPlacementCSS();
        });
    $("td").click(function () {
        let cellID = $(this).attr("id");
        let cell = sudoku.getCellFromID(cellID);
        sudoku.setCellFromID(cellID, cell + 1);
        
        sudoku.updateHTML();
        sudoku.setValidPlacementCSS();
    });
    $(window).keypress(function (e) {
        if (e.keyCode == 8) {
            if(sudoku.getCellMutableFromID(currCellID)) sudoku.setCellFromID(currCellID, 0);
        } else {
            if(sudoku.getCellMutableFromID(currCellID)) sudoku.setCellFromID(currCellID, e.keyCode - 48);
        }
        sudoku.updateHTML();
        sudoku.setValidPlacementCSS();
        if(Sudoku.checkCompleteSudoku(sudoku)){
            alert("You Win!");
        }
    });
    $("#new").click(function () {
        sudoku = generateSudoku(difficulty);
        sudoku.updateHTML();
        sudoku.setValidPlacementCSS();
    });
    $("#solve").click(function () {
        timeOut = 0
        Solver.solve(sudoku);
        sudoku.updateHTML();
        sudoku.setValidPlacementCSS();
    });
    $("#difficulty").click(function() {
        let currDifficulty = document.getElementById("difficulty").innerHTML;
        if(currDifficulty == "Difficulty: Easy") difficulty = "Medium";
        else if(currDifficulty == "Difficulty: Medium") difficulty = "Hard";
        else if(currDifficulty == "Difficulty: Hard") difficulty = "Easy";
        document.getElementById("difficulty").innerHTML = "Difficulty: " + difficulty;
    })
    sudoku.updateHTML();
    sudoku.setValidPlacementCSS();
});


function getIDfromIndices(i, j) {
    return "#" + i.toString() + "-" + j.toString();
}