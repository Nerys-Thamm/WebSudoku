var currCellID = "0-0" // the id of the currently selected cell
const rowlen = 9; // the length of a row in the sudoku grid
const rownum = 9; // the number of rows in the sudoku grid
const maxSolverIterations = 100; // the maximum number of times the solver will try to solve the sudoku

// returns the indices of the cell with the given id
function getSingleIndex(i, j) {
    return i * rowlen + j;
}

// clamp the given value to the range [min, max]
function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}


// Class representing a sudoku grid
class Sudoku {
    constructor() {//Constructor
        this.cells = new Array(rowlen * rownum);
        this.unmutableCells = new Array(rowlen * rownum);
        for (let i = 0; i < rownum; i++) {
            for (let j = 0; j < rowlen; j++) {
                this.cells[getSingleIndex(i, j)] = 0;
                this.unmutableCells[getSingleIndex(i, j)] = true;
            }
        }
    }
    static copy(sudoku) {//Copy Constructor
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
    updateHTML() { //Update the HTML of the page
        for (let i = 0; i < rownum; i++) {
            for (let j = 0; j < rowlen; j++) {
                let cell = this.getCell(i, j);
                let cellID = i + "-" + j;
                document.getElementById(cellID).innerHTML = cell;
            }
        }
    }

    
    //Generate a sudoku with the provided number of clues
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
    checkValidRow(i) { //Check if the row is valid
        let row = new Array(9);
        for (let j = 0; j < rowlen; j++) {
            row[j] = this.getCell(i, j);
        }
        return Sudoku.checkValid(row);
    }
    checkValidColumn(j) { //Check if the column is valid
        let column = new Array(9);
        for (let i = 0; i < rownum; i++) {
            column[i] = this.getCell(i, j);
        }
        return Sudoku.checkValid(column);
    }
    
    checkValidSubgrid(i, j) { //Check if the subgrid is valid
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
    static checkValidSudoku(sudoku) { //Check if the sudoku is valid
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
        return complete && Sudoku.checkValidSudoku(sudoku); //Check if the sudoku is complete and valid
    }
    setValidPlacementCSS() { //Set the CSS of the cells to indicate valid placement
        for (let i = 0; i < rownum; i++) { //For each row
            for (let j = 0; j < rowlen; j++) { //For each cell
                let cellID = i + "-" + j; //Get the ID of the cell
                let cell = this.getCell(i, j); //Get the value of the cell
                if (cell == 0) { //If the cell is empty
                    document.getElementById(cellID).style.backgroundColor = "OldLace"; //Set the background color to OldLace
                } else if(!this.getCellMutableFromID(cellID)) { //If the cell is not mutable
                    document.getElementById(cellID).style.backgroundColor = "PaleGoldenRod"; //Set the background color to PaleGoldenRod
                } else if(this.checkValidRow(i) && this.checkValidColumn(j) && this.checkValidSubgrid(i - (i % 3), j - (j % 3))) { //If the cell is valid
                    document.getElementById(cellID).style.backgroundColor = "darkseagreen"; //Set the background color to darkseagreen
                } else { //If the cell is invalid
                    document.getElementById(cellID).style.backgroundColor = "red"; //Set the background color to red
                }
            }
        }
        if(currCellID != null && currCellID != undefined && this.getCellMutableFromID(currCellID)) document.getElementById(currCellID).style.backgroundColor = "orange"; //Set the background color of the current cell to orange
        else if(currCellID != null && currCellID != undefined) document.getElementById(currCellID).style.backgroundColor = "PeachPuff"; //Set the background color of the current cell to PeachPuff
    }

    trimToClues(clueNum) { //Trim the sudoku to the number of clues
        var clueCount = 9; //Number of clues
        for (let i = 0; i < 3; i++) { //Check each subgrid
            for (let j = 0; j < 3; j++) { //Check each subgrid
                clueCount = 9 
                while (clueCount > clueNum) { //While there are more clues than the number we want
                    let randI = Math.floor(Math.random() * 3); //Randomly choose a row
                    let randJ = Math.floor(Math.random() * 3); //Randomly choose a column
                    if (this.getCell((i*3) + randI, (j*3) + randJ) != 0) { //If the cell is not empty
                        this.setCell((i*3) + randI, (j*3) + randJ, 0); //Set the cell to empty
                        this.unmutableCells[getSingleIndex((i*3) + randI, (j*3) + randJ)] = true; //Set the cell to mutable
                        clueCount--; //Decrement the clue count
                    }
                }
                for (let k = 0; k < 3; k++) { //Check each row
                    for (let l = 0; l < 3; l++) { //Check each column
                        if (this.getCell((i*3) + k, (j*3) + l) != 0) { //If the cell is not empty
                            this.unmutableCells[getSingleIndex((i*3) + k, (j*3) + l)] = false; //Set the cell to unmutable
                        }
                    }
                }
            }
        }
    }
}


var timeOut = 0
class Solver {//Solves the sudoku
    static solve(sudoku, iterations) {
        if(iterations == 0) timeOut = 0 //Reset timeout
        else timeOut += 1 //increment timeOut
        if(timeOut > 2000) return false //If the solver has been stuck for too long, return false
        if(iterations > maxSolverIterations) return false; //If the solver has been stuck for too long, return false
        for (let i = 0; i < rownum; i++) { //check all rows
            for (let j = 0; j < rowlen; j++) { //check all columns
                if (sudoku.getCell(i, j) == 0) { //if cell is empty
                    for (let n = 1; n <= 9; n++) { //check all numbers
                        sudoku.setCell(i, j, n); //try setting the number
                        if (sudoku.checkValidRow(i) && sudoku.checkValidColumn(j) && sudoku.checkValidSubgrid(i - (i % 3), j - (j % 3))) { //if valid
                            if (Solver.solve(sudoku, iterations++)) { //recurse
                                return true; //if solved
                            }else if(iterations > maxSolverIterations) return false; //if max iterations reached
                        }else if(iterations > maxSolverIterations) return false; //if max iterations reached
                    }
                    sudoku.setCell(i, j, 0); //if no valid numbers, set cell back to 0
                    return false; //if no valid numbers, return false
                }
            }
        }
        return true;
    }
    updateHTML() {
        sudoku.updateHTML();
    }
}



function getDifficultyNum(difficulty) { //returns the difficulty number for the difficulty
    if (difficulty == "Easy") return 4;
    else if (difficulty == "Medium") return 3;
    else if (difficulty == "Hard") return 2;
    else return 1;
}

function generateSudoku(difficulty) { //generates a sudoku with the difficulty
    let numClues = getDifficultyNum(difficulty);
    var newSudoku = Sudoku.generateNewSudoku(1);
    while(!Solver.solve(newSudoku, 0)) //solves the sudoku until it is solvable
    {
        newSudoku = Sudoku.generateNewSudoku(1)
    }
    newSudoku.trimToClues(numClues); //trims the sudoku to the number of clues
    return newSudoku;
}

var difficulty = "Easy"; //default difficulty
var sudoku = generateSudoku(difficulty); //generates a sudoku with the difficulty



generateSudoku(difficulty); //generates a sudoku with the difficulty


$(document).ready(function () { //Called when the document is ready
    $("td").hover(function () { //Called when the mouse hovers over a cell
        let cellID = $(this).attr("id"); //Gets the ID of the cell
        currCellID = cellID; //Sets the current cell ID
        let cell = sudoku.getCellFromID(cellID); //Gets the cell from the ID
        sudoku.setValidPlacementCSS(); //Updates the valid placement CSS
    },
        function () { //Called when the mouse leaves a cell
        currCellID = null; //Sets the current cell ID to null
        sudoku.setValidPlacementCSS(); //Updates the valid placement CSS
        });
    $("td").click(function () { //Called when the cell is clicked
        let cellID = $(this).attr("id"); //Gets the ID of the cell
        let cell = sudoku.getCellFromID(cellID); //Gets the cell from the ID
        sudoku.setCellFromID(cellID, cell + 1); //Sets the cell to the next number
        
        sudoku.updateHTML(); //Updates the HTML
        sudoku.setValidPlacementCSS(); //Updates the valid placement CSS
    });
    $(window).keypress(function (e) { //Called when a key is pressed
        if (e.keyCode == 8) { //If the key is backspace
            if(sudoku.getCellMutableFromID(currCellID)) sudoku.setCellFromID(currCellID, 0); //Sets the cell to 0
        } else { //If the key is not backspace
            if(sudoku.getCellMutableFromID(currCellID)) sudoku.setCellFromID(currCellID, e.keyCode - 48); //Sets the cell to the number
        }
        sudoku.updateHTML(); //Updates the HTML
        sudoku.setValidPlacementCSS(); //Updates the valid placement CSS
        if(Sudoku.checkCompleteSudoku(sudoku)){ //Checks if the sudoku is complete
            alert("You Win!"); //Alerts the user they won
        }
    });
    $("#new").click(function () { //Called when the new button is clicked
        sudoku = generateSudoku(difficulty); //Generates a new sudoku
        sudoku.updateHTML(); //Updates the HTML
        sudoku.setValidPlacementCSS(); //Updates the valid placement CSS
    });
    $("#solve").click(function () { //Called when the solve button is clicked
        timeOut = 0 //Resets the timeout
        Solver.solve(sudoku); //Solves the sudoku
        sudoku.updateHTML(); //Updates the HTML
        sudoku.setValidPlacementCSS(); //Updates the valid placement CSS
    });
    $("#difficulty").click(function() { //Called when the difficulty button is clicked
        let currDifficulty = document.getElementById("difficulty").innerHTML; //Gets the current difficulty
        if(currDifficulty == "Difficulty: Easy") difficulty = "Medium"; //Sets the difficulty to medium
        else if(currDifficulty == "Difficulty: Medium") difficulty = "Hard"; //Sets the difficulty to hard
        else if(currDifficulty == "Difficulty: Hard") difficulty = "Easy"; //Sets the difficulty to easy
        document.getElementById("difficulty").innerHTML = "Difficulty: " + difficulty; //Updates the difficulty
    })
    sudoku.updateHTML(); //Updates the HTML
    sudoku.setValidPlacementCSS(); //Updates the valid placement CSS
});


function getIDfromIndices(i, j) {
    return "#" + i.toString() + "-" + j.toString();
}