import React, {Component} from "react";
import Deck from "./Deck/Deck";
import Board from "./Board/Board";
import Control from "./Control/Control";
import Popup from "./Popup";
import GameTimer from "./Stats/Stats-Components/GameTimer/GameTimer";

import "./App.css";
class StatsTimer {
    constructor() {
        this.minutes = "00",
        this.seconds = "00"
        this.totalSeconds = 0;
        this.StartTimer = this.StartTimer.bind(this);
        this.StopTimer = this.StopTimer.bind(this);
        this.ClearTimerStats = this.ClearTimerStats.bind(this);
        this._pad = this._pad.bind(this);
    }

    _pad(val) {
        let valString = val + "";
        let res = "";
        
        if (valString.length < 2) { 
            res = "0" + valString;
        }
        else {
            res = valString;
        }

        return res;
    }

    StopTimer() {
        clearInterval(this.timer);
    }

    ClearTimerStats() {
        this.minutes = "00",
        this.seconds = "00"
        this.totalSeconds = 0;
    }

    StartTimer() {
        this.ClearTimerStats();
        let totalSeconds = 0;
        let tick = function() {
            this.totalSeconds++;
            totalSeconds++;
            this.seconds = this._pad(totalSeconds % 60);
            this.minutes = this._pad(parseInt(totalSeconds / 60));
        }.bind(this);

        this.timer = setInterval(tick, 1000);
    }
  
}
class Statistics {
    constructor() {
        this.numOfTurns = 0;                 // 9.1
        this.timeFromStartSeconds = 0;       // 9.2
        this.avgTimeOfTurnSeconds = 0;       // 9.3   -- TimeFromStart/numOfTurns
        this.numOfTileDraws = 0;             // 9.4
        this.sumOfHandWeight = 0;            // 9.5
        this.statsTimer = new StatsTimer();
        
        this.TurnStart = this.TurnStart.bind(this);
        this.TurnEnd = this.TurnEnd.bind(this);
        this.GetTimeString = this.GetTimeString.bind(this);
        this.Update = this.Update.bind(this);
        this._updateSumOfHandWeight = this._updateSumOfHandWeight.bind(this);
        this._updateAvgTimeOfTurn = this._updateAvgTimeOfTurn.bind(this);
        this._updateTime = this._updateTime.bind(this);
        this.copyCtr = this.copyCtr.bind(this);
    }

    copyCtr() {
        let res = new Statistics();
        res.numOfTurns = this.numOfTurns;               
        res.timeFromStartSeconds = this.timeFromStartSeconds;     
        res.avgTimeOfTurnSeconds = this.avgTimeOfTurnSeconds;     
        res.numOfTileDraws = this.numOfTileDraws;           
        res.sumOfHandWeight = this.sumOfHandWeight;     
        return res;     
    }

    TurnStart() {
        this.statsTimer.StartTimer();
    }

    TurnEnd() {
        this.statsTimer.StopTimer();
    }

    Update(playerHand, moveWasDraw) {
        if(moveWasDraw) {
            this.numOfTileDraws ++;
        }

        this.numOfTurns ++;
        this._updateSumOfHandWeight(playerHand);
        this._updateTime();
    }

    _updateSumOfHandWeight(hand) {
        let sum = 0;
        for(let i = 0 ; i < hand.length ; i++) {
            for(let j = 0 ; j <hand[i].length ; j++) {
                if(hand[i][j].occupied) {
                    sum += hand[i][j].brick[0] + hand[i][j].brick[1];
                }
            }
        }
        this.sumOfHandWeight = sum;
    }

    _updateTime() {
        this.timeFromStartSeconds += this.statsTimer.totalSeconds;
        this._updateAvgTimeOfTurn();
    }


    _updateAvgTimeOfTurn() {
        this.avgTimeOfTurnSeconds = 0;
        if(this.numOfTurns > 1) {      // weird bug when doing numOfTurn > 0 we will get NaN on avgTime
            this.avgTimeOfTurnSeconds = (this.timeFromStartSeconds / this.numOfTurns).toFixed(2);
        }
    }

    GetTimeString() {
        return `${this.timeFromStartSeconds/60}: ${this.timeFromStartSeconds %60}`;
    }
}
class History {
    constructor (num, gameStart, p1Deck, boardB, pd, board, pile, p1Stats) {
        this.numOfPlayers = this.deepClone(num);
        this.isGameStarted = this.deepClone(gameStart);
        this.player1Deck = this.deepClone(p1Deck);
        this.boardBricks = this.deepClone(boardB);
        this.playerDeck = this.deepClone(pd);
        this.myBoard = this.deepClone(board);
        this.myPile = this.deepClone(pile);
        this.player1Stats = p1Stats;
    }

    deepClone(x) {
        return JSON.parse(JSON.stringify(x));
    }
}

class App extends Component {
    constructor() {
        super();
        this.state = {
            numOfPlayers: 1, 
            isGameStarted: false,
            isTimerStarted: false,
            isGameEnded: false,
            popupMessage: "",
            selectedBrick: { numbers: [],
                            status: ""},
            player1Deck: [],
            boardBricks: [],
            playerDeck: [],
            myBoard: [],
            myPile: [],
            history: [],
            next: [],
            isPileEmpty: false,
            isCheckEndGame: false,
            isLeftMoves: "",
            player1Stats: new Statistics(),
        };

        this.handleGame = this.handleGame.bind(this);
        this.handlePlayerDeck = this.handlePlayerDeck.bind(this);
        this.handleClickedBrick = this.handleClickedBrick.bind(this);
        this.dealRandomBricksToPlayer = this.dealRandomBricksToPlayer.bind(this);
        this.isMoveLegal = this.addBrickToBoard.bind(this);
        this.handleDrawClick = this.handleDrawClick.bind(this);
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
        this.deepClone = this.deepClone.bind(this);
        this.isLegalMove = this.isLegalMove.bind(this);
        this.isLegalDraw = this.isLegalDraw.bind(this);
        this.getCurrentGameState = this.getCurrentGameState.bind(this);
        this.saveCurrentStateForNext = this.saveCurrentStateForNext.bind(this);
        this.saveCurrentStateForHistory = this.saveCurrentStateForHistory.bind(this);
        this.handlePrevClick = this.handlePrevClick.bind(this);
        this.doPrev = this.doPrev.bind(this);
        this.handleNextClick = this.handleNextClick.bind(this);
        this.doNext = this.doNext.bind(this);
        this.handleUndoClick = this.handleUndoClick.bind(this);
        this.doUndo = this.doUndo.bind(this);
        this.nextTurn = this.nextTurn.bind(this);
        this.updateStatsAfterMove = this.updateStatsAfterMove.bind(this);
        this.checkEndGame = this.checkEndGame.bind(this);
        this.togglePopup = this.togglePopup.bind(this);
        this.checkLeftValidMoves = this.checkLeftValidMoves.bind(this);
        this.handleTimer = this.handleTimer.bind(this);
        this.checkDrawGlow = this.checkDrawGlow.bind(this);
    }

    getCurrentGameState() {
        if(this.state.history.length === 1) {
            this.state.player1Stats = new Statistics();
        }

        let currentGameState = new History(this.state.numOfPlayers, this.state.isGameStarted, this.state.player1Deck, this.state.boardBricks, this.state.playerDeck, this.state.myBoard, this.state.myPile, this.state.player1Stats.copyCtr());
       
        return currentGameState;
    }

    doUndo() {
        if(this.state.history.length <= 1) {
            return;
        }

        let prev = this.state.history.pop();
        this.setState({
            numOfPlayers: prev.numOfPlayers, 
            isGameStarted: prev.isGameStarted,
            player1Deck: prev.player1Deck,
            boardBricks: prev.boardBricks,  
            playerDeck: prev.playerDeck,
            myBoard: prev.myBoard,
            myPile: prev.myPile,
            player1Stats: prev.player1Stats,
        });
    }

    dealRandomBricksToPlayer() {
        let myPile = [
                    [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
                    [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [2, 2], 
                    [2, 3], [2, 4], [2, 5], [2, 6], [3, 3], [3, 4], [3, 5], 
                    [3, 6], [4, 4], [4, 5], [4, 6], [5, 5], [5, 6], [6, 6],
                    ];

        for(let players = 0 ; players < this.state.numOfPlayers ; players++) {
            let playerDeck = [];

            for(let i = 0 ; i < 6 ; i++) {
                let randomIndex = Math.floor(Math.random() * myPile.length);
                playerDeck.push(myPile[randomIndex]);
                myPile = myPile.filter((item, j) => j !== randomIndex);
            }
        
            this.setState(() => {
                return {
                    myPile: myPile,
                    player1Deck: playerDeck,
                }
            })
        }
    }
    
    checkDrawGlow() {
        if(!this.checkLeftValidMoves()) {
            this.setState((state) => {
                return {
                    isLeftMoves: "no-moves"
                }
            })
        }
    }

    checkEndGame() {
        let res = "";
        
        this.updateStatsAfterMove(false);
        this.checkDrawGlow();
        if(this.state.player1Deck.length === 0) {
            res = "Win!"
        }
        else if(this.state.isPileEmpty && !(this.checkLeftValidMoves())) {
            res = "You Lost!"
        }
        if(res !== "") {

            this.setState(() => {
                return {
                    isGameEnded: !this.state.isGameEnded,
                    isTimerStarted: false,
                    popupMessage: res
                }
            })
        }
        this.setState(() => {
            return {
                isCheckEndGame: false,
                
            }
        })
    }

    checkLeftValidMoves() {
        for(let i = 0 ; i < this.state.player1Deck.length ; i++) {
            let res = this.isLegalMove(this.state.player1Deck[i]);
            if (res) {
                return true;
            }
        }
        return false;
    }
    

    togglePopup() {
        this.setState(() => {
            return {
                isGameEnded: !this.state.isGameEnded,
                isTimerStarted: true 
            }
          });
    }

    handleGame(info) {
        this.dealRandomBricksToPlayer();
        this.setState({
            isGameStarted: info.isGameStarted,
            isTimerStarted: info.isGameStarted
        });

        this.saveCurrentStateForHistory();
        this.nextTurn();
    }

    handlePlayerDeck(deck) {
        this.setState({
            player1Deck: deck
        });
    }

    handleMouseOut() { 
        this.setState(() => {
            return {selectedBrick: {numbers: [],
                                        status: "neutral"}}})
    }

    
    handleDrop(e, con) {
        let id = e.dataTransfer.getData("id");
        let brick = id.split(",").map(Number);
        this.addBrickToBoard(brick);
    }

    handleDragOver(e) {
        e.preventDefault();
    }

    handleMouseOver(brick) {
        let returnedValue = this.isLegalMove(brick)

        if(!returnedValue) {
            this.setState(() => {
                return {selectedBrick: {numbers: brick,
                                            status: "invalid"}}})
        }
        else {
            this.setState(() => {
                return {selectedBrick: {numbers: brick,
                                            status: "valid"}}})}
    }

    handleClickedBrick(brick) {
        if(this.isLegalMove(brick)) {
            let returnedValue = this.addBrickToBoard(brick);
            this.setState({
                myBoard: returnedValue.myBoard,
                player1Deck: returnedValue.player1Deck,
                isCheckEndGame: true});

            //this.updateStatsAfterMove(false);
            this.nextTurn();
        }
    }

    nextTurn() {
        // when we will add multiplayer, we will need to add logic
        this.state.player1Stats.TurnEnd();
        this.state.player1Stats.TurnStart();
    }

    isLegalMove(brick) {
        let myBoard = this.deepClone(this.state.myBoard);

        if(myBoard.length === 0) {
           return true;
        }

        for(let i = 0 ; i < myBoard.length ; i++) {
            for(let j = 0 ; j < myBoard[i].length ; j++) {
                let currBrick = myBoard[i][j];
                if(currBrick.occupied) {

                    let row = currBrick.position.row;
                    let column = currBrick.position.column;
                    
                    if((currBrick.brick[0] === brick[1]) || (currBrick.brick[0]) === brick[0]) {
                        if(!((myBoard[row - 1]) && (myBoard[row - 1][column].occupied)) && currBrick.direction === "vertical") {
                            return true;
                        }
                        else if(!((myBoard[0][column + 1]) && (myBoard[row][column + 1].occupied)) && currBrick.direction === "horizontal" ) {
                            return true;
                        }
                        if(currBrick.brick[0] === currBrick.brick[1]) {
                            if(!((myBoard[row - 1]) && (myBoard[row - 1][column].occupied)) && currBrick.direction === "horizontal" ) {
                                return true;
                            }
                            else if(!((myBoard[row + 1]) && (myBoard[row + 1][column].occupied)) && currBrick.direction === "horizontal") {
                                return true;
                            }
                            else if(!((myBoard[0][column + 1]) && (myBoard[row][column + 1].occupied)) && currBrick.direction === "vertical") {
                                return true;
                            }
                            else if(!((myBoard[0][column - 1]) && (myBoard[row][column - 1].occupied)) && currBrick.direction === "vertical") {
                                return true;
                            }
                        }
                    }

                    if((currBrick.brick[1] == brick[0]) || (currBrick.brick[1] == brick[1])) {
                        if(!((myBoard[row + 1]) && (myBoard[row + 1][column].occupied)) && currBrick.direction === "vertical") {
                            return true;
                        }
                        else if(!((myBoard[0][column - 1]) && (myBoard[row][column - 1].occupied)) && currBrick.direction === "horizontal") {
                            return true;
                        }
                    }
                }   
            }
        }

        return false;
    }

    deepClone(x) {
        return JSON.parse(JSON.stringify(x));
    }

    addBrickToBoard(brick) {
        let myBoard = this.deepClone(this.state.myBoard);
        let player1Deck = this.state.player1Deck;
        //maybe it's not good to declare it here
        let brickToInsert = {brick: brick,
                            direction: "vertical",
                            occupied: true,
                            position: {row: 0,
                                        column: 0}};
        if(!this.isLegalMove(brick))
        {
            return;
        }
        
        this.saveCurrentStateForHistory();
        //Zero Condition//
        if(myBoard.length === 0) {
            myBoard.push([brickToInsert]);
            player1Deck = player1Deck.filter((item) => item !== brick);
        }
        else {
            let found = false;
            let currBrick = null;
            let row = null;
            let column = null;

            for(let i = 0 ; i < myBoard.length ; i++) {
                for(let j = 0 ; j < myBoard[i].length ; j++) {
                    currBrick = myBoard[i][j];
                    
                    if(!found && currBrick.occupied) {
                        row = currBrick.position.row;
                        column = currBrick.position.column;

                        //First Condition//
                        if(currBrick.brick[0] === brick[1] && !found) {
                            if(!((myBoard[row - 1]) && (myBoard[row - 1][column].occupied)) && currBrick.direction === "vertical") {
                                if(!myBoard[row - 1]) {
                                    for(let i = 0 ; i < myBoard.length ; i++) {
                                        for(let j = 0 ; j < myBoard[i].length ; j++) {
                                            if(myBoard[i][j].occupied) {
                                                myBoard[i][j].position.row++; //changing
                                            }
                                        } 
                                    } 

                                    let newLine = [];
                                    for(let i = 0 ; i < myBoard[0].length ; i++) {
                                        newLine.push({occupied: false})
                                    }
                                    myBoard.unshift(newLine);
                                }
                                if(brick[0] === brick[1]) {
                                        brickToInsert.direction = "horizontal";
                                }
                                else {
                                    brickToInsert.direction = currBrick.direction;
                                }

                                brickToInsert.position.column = currBrick.position.column;
                                brickToInsert.position.row = currBrick.position.row - 1;
                                myBoard[brickToInsert.position.row][brickToInsert.position.column] = brickToInsert;
                                player1Deck = player1Deck.filter((item) => item !== brick);

                                found = true;
                            }

                            //Fifth Condition//
                            else if(!((myBoard[0][column + 1]) && (myBoard[row][column + 1].occupied)) && currBrick.direction === "horizontal") {
                                if(!myBoard[0][column + 1]) {
                                    for(let i = 0 ; i < myBoard.length ; i++) {
                                        myBoard[i].push({occupied: false});
                                    } 
                                }
                                if(brick[0] === brick[1]) {
                                        brickToInsert.direction = "vertical";
                                }
                                else {
                                    brickToInsert.direction = currBrick.direction;
                                }
                                brickToInsert.position.column = currBrick.position.column + 1;
                                brickToInsert.position.row = currBrick.position.row;
                                myBoard[brickToInsert.position.row][brickToInsert.position.column] = brickToInsert;
                                player1Deck = player1Deck.filter((item) => item !== brick);
                                found = true;
                            }
                            
                            if(currBrick.brick[0] === currBrick.brick[1] && !found) {
                                if(!((myBoard[row - 1]) && (myBoard[row - 1][column].occupied)) && currBrick.direction === "horizontal") {
                                    if(!myBoard[row - 1]) {
                                        for(let i = 0 ; i < myBoard.length ; i++) {
                                            for(let j = 0 ; j < myBoard[i].length ; j++) {
                                                if(myBoard[i][j].occupied) {
                                                    myBoard[i][j].position.row++; //changing
                                                }
                                            } 
                                        } 
    
                                        let newLine = [];
                                        for(let i = 0 ; i < myBoard[0].length ; i++) {
                                            newLine.push({occupied: false})
                                        }
                                        myBoard.unshift(newLine);
                                    }
                                    brickToInsert.direction = "vertical";
                                    brickToInsert.position.column = currBrick.position.column;
                                    brickToInsert.position.row = currBrick.position.row - 1;
                                    myBoard[brickToInsert.position.row][brickToInsert.position.column] = brickToInsert;
                                    player1Deck = player1Deck.filter((item) => item !== brick);
    
                                    found = true;
                                }
                                ///////////////////
                                else if(!((myBoard[row + 1]) && (myBoard[row + 1][column].occupied)) && currBrick.direction === "horizontal") {
                                    brickToInsert.brick = [brick[1], brick[0]];
                                    if(!myBoard[row + 1]) {
                                        let newLine = [];
                                        for(let i = 0 ; i < myBoard[0].length ; i++) {
                                            newLine.push({occupied: false})
                                        } 
                                        myBoard.push(newLine);
                                    }
                                    
                                    brickToInsert.direction = "vertical";
                                    brickToInsert.position.row = currBrick.position.row + 1;
                                    brickToInsert.position.column = currBrick.position.column;
                                    myBoard[brickToInsert.position.row][brickToInsert.position.column] = brickToInsert;
                                    player1Deck = player1Deck.filter((item) => item !== brick);
                                    
                                    found = true;
                                }


                                else if(!((myBoard[0][column + 1]) && (myBoard[row][column + 1].occupied)) && currBrick.direction === "vertical") {
                                    if(!myBoard[0][column + 1]) {
                                        for(let i = 0 ; i < myBoard.length ; i++) {
                                            myBoard[i].push({occupied: false});
                                        } 
                                    }
                                    brickToInsert.direction = "horizontal";
                                    brickToInsert.position.column = currBrick.position.column + 1;
                                    brickToInsert.position.row = currBrick.position.row;
                                    myBoard[brickToInsert.position.row][brickToInsert.position.column] = brickToInsert;
                                    player1Deck = player1Deck.filter((item) => item !== brick);
                                    found = true;
                                }
                                ////////////////////////////////
                                else if(!((myBoard[0][column - 1]) && (myBoard[row][column - 1].occupied)) && currBrick.direction === "vertical") {
                                    brickToInsert.brick = [brick[1], brick[0]];
                                    if(!myBoard[0][column - 1]) {
                                        for(let i = 0 ; i < myBoard.length ; i++) {
                                            myBoard[i].unshift({occupied: false});
                                            for(let j = 0 ; j < myBoard[i].length ; j++) {
                                                if(myBoard[i][j].occupied) {
                                                    myBoard[i][j].position.column++; //changing
                                                }
                                            } 
                                        } 
                                    }
                                    brickToInsert.direction = "horizontal";
                                    brickToInsert.position.row = currBrick.position.row;
                                    brickToInsert.position.column = currBrick.position.column - 1;
                                    myBoard[brickToInsert.position.row][brickToInsert.position.column] = brickToInsert;
                                    player1Deck = player1Deck.filter((item) => item !== brick);
                                    
                                    found = true;
                                }

                            }
                        }    
                            //Second Condition//
                        if(currBrick.brick[1] === brick[0] && !found) {
                            if(!((myBoard[row + 1]) && (myBoard[row + 1][column].occupied)) && currBrick.direction === "vertical") {
                                if(!myBoard[row + 1]) {
                                    let newLine = [];
                                    for(let i = 0 ; i < myBoard[0].length ; i++) {
                                        newLine.push({occupied: false})
                                    } 
                                    myBoard.push(newLine);
                                }
                                if(brick[0] === brick[1]) {
                                        brickToInsert.direction = "horizontal";
                                }
                                else {
                                    brickToInsert.direction = currBrick.direction;
                                }

                                brickToInsert.position.row = currBrick.position.row + 1;
                                brickToInsert.position.column = currBrick.position.column;
                                myBoard[brickToInsert.position.row][brickToInsert.position.column] = brickToInsert;
                                player1Deck = player1Deck.filter((item) => item !== brick);
                                
                                found = true;
                            }
                            
                            //Sixth Condition//
                            else if(!((myBoard[0][column - 1]) && (myBoard[row][column - 1].occupied)) && currBrick.direction === "horizontal" && !found) {
                                if(!myBoard[0][column - 1]) {
                                    for(let i = 0 ; i < myBoard.length ; i++) {
                                        myBoard[i].unshift({occupied: false});
                                        for(let j = 0 ; j < myBoard[i].length ; j++) {
                                            if(myBoard[i][j].occupied) {
                                                myBoard[i][j].position.column++; //changing
                                            }
                                        } 
                                    } 
                                }
                                if(brick[0] === brick[1]) {
                                        brickToInsert.direction = "vertical";
                                }
                                else {
                                    brickToInsert.direction = currBrick.direction;
                                }
                                
                                brickToInsert.position.row = currBrick.position.row;
                                brickToInsert.position.column = currBrick.position.column - 1;
                                myBoard[brickToInsert.position.row][brickToInsert.position.column] = brickToInsert;
                                player1Deck = player1Deck.filter((item) => item !== brick);
                                
                                found = true;
                            }
                            if(currBrick.brick[0] === currBrick.brick[1] && !found) {
                                if(!((myBoard[row + 1]) && (myBoard[row + 1][column].occupied)) && currBrick.direction === "horizontal") {
                                    if(!myBoard[row + 1]) {
                                        let newLine = [];
                                        for(let i = 0 ; i < myBoard[0].length ; i++) {
                                            newLine.push({occupied: false})
                                        } 
                                        myBoard.push(newLine);
                                    }
                                    brickToInsert.direction = "vertical";
                                    brickToInsert.position.row = currBrick.position.row + 1;
                                    brickToInsert.position.column = currBrick.position.column;
                                    myBoard[brickToInsert.position.row][brickToInsert.position.column] = brickToInsert;
                                    player1Deck = player1Deck.filter((item) => item !== brick);
                                    
                                    found = true;
                                }
                                //////////////////////////////////////////////////////
                                else if(!((myBoard[row - 1]) && (myBoard[row - 1][column].occupied)) && currBrick.direction === "horizontal") {
                                    brickToInsert.brick = [brick[1], brick[0]];
                                    if(!myBoard[row - 1]) {
                                        for(let i = 0 ; i < myBoard.length ; i++) {
                                            for(let j = 0 ; j < myBoard[i].length ; j++) {
                                                if(myBoard[i][j].occupied) {
                                                    myBoard[i][j].position.row++; //changing
                                                }
                                            } 
                                        } 
    
                                        let newLine = [];
                                        for(let i = 0 ; i < myBoard[0].length ; i++) {
                                            newLine.push({occupied: false})
                                        }
                                        myBoard.unshift(newLine);
                                    }
                                    brickToInsert.direction = "vertical";
                                    brickToInsert.position.column = currBrick.position.column;
                                    brickToInsert.position.row = currBrick.position.row - 1;
                                    myBoard[brickToInsert.position.row][brickToInsert.position.column] = brickToInsert;
                                    player1Deck = player1Deck.filter((item) => item !== brick);
    
                                    found = true;
                                }
                                
                                else if(!((myBoard[0][column - 1]) && (myBoard[row][column - 1].occupied)) && currBrick.direction === "vertical") {
                                    if(!myBoard[0][column - 1]) {
                                        for(let i = 0 ; i < myBoard.length ; i++) {
                                            myBoard[i].unshift({occupied: false});
                                            for(let j = 0 ; j < myBoard[i].length ; j++) {
                                                if(myBoard[i][j].occupied) {
                                                    myBoard[i][j].position.column++; //changing
                                                }
                                            } 
                                        } 
                                    }
                                    brickToInsert.direction = "horizontal";
                                    brickToInsert.position.row = currBrick.position.row;
                                    brickToInsert.position.column = currBrick.position.column - 1;
                                    myBoard[brickToInsert.position.row][brickToInsert.position.column] = brickToInsert;
                                    player1Deck = player1Deck.filter((item) => item !== brick);
                                    
                                    found = true;
                                }
                                ////////////////////////////////
                                else if(!((myBoard[0][column + 1]) && (myBoard[row][column + 1].occupied)) && currBrick.direction === "vertical") {
                                    brickToInsert.brick = [brick[1], brick[0]];
                                    if(!myBoard[0][column + 1]) {
                                        for(let i = 0 ; i < myBoard.length ; i++) {
                                            myBoard[i].push({occupied: false});
                                        } 
                                    }
                                    brickToInsert.direction = "horizontal";
                                    brickToInsert.position.column = currBrick.position.column + 1;
                                    brickToInsert.position.row = currBrick.position.row;
                                    myBoard[brickToInsert.position.row][brickToInsert.position.column] = brickToInsert;
                                    player1Deck = player1Deck.filter((item) => item !== brick);
                                    found = true;
                                }
                            }
                        }
                        
                        //Third Condition//
                        if(currBrick.brick[0] === brick[0] & !found) {
                            if(!((myBoard[row - 1]) && (myBoard[row - 1][column].occupied)) && currBrick.direction === "vertical") {
                                brickToInsert.brick = [brick[1], brick[0]];
                                if(!myBoard[row - 1]) {
                                    for(let i = 0 ; i < myBoard.length ; i++) {
                                        for(let j = 0 ; j < myBoard[i].length ; j++) {
                                            if(myBoard[i][j].occupied) {
                                                myBoard[i][j].position.row++; //changing
                                            }
                                        } 
                                    } 

                                    let newLine = [];
                                    for(let i = 0 ; i < myBoard[0].length ; i++) {
                                        newLine.push({occupied: false})
                                    }
                                    myBoard.unshift(newLine);
                                }
                                if(brick[0] === brick[1]) {
                                    brickToInsert.direction = "horizontal";
                                }
                                else {
                                    brickToInsert.direction = currBrick.direction;
                                }
                                
                                brickToInsert.position.column = currBrick.position.column;
                                brickToInsert.position.row = currBrick.position.row - 1;
                                myBoard[brickToInsert.position.row][brickToInsert.position.column] = brickToInsert;
                                player1Deck = player1Deck.filter((item) => item !== brick);
                                
                                found = true;
                            }
                            
                            //Seventh Condition//
                            else if(!((myBoard[0][column + 1]) && (myBoard[row][column + 1].occupied)) && currBrick.direction === "horizontal" && !found) {
                                brickToInsert.brick = [brick[1], brick[0]];
                                if(!myBoard[0][column + 1]) {
                                    for(let i = 0 ; i < myBoard.length ; i++) {
                                        myBoard[i].push({occupied: false});
                                    } 
                                }
                                if(brick[0] === brick[1]) {
                                    brickToInsert.direction = "vertical"; 
                                }
                                else {
                                    brickToInsert.direction = currBrick.direction;
                                }
                                
                                brickToInsert.position.row = currBrick.position.row;
                                brickToInsert.position.column = currBrick.position.column + 1;
                                myBoard[brickToInsert.position.row][brickToInsert.position.column] = brickToInsert;
                                player1Deck = player1Deck.filter((item) => item !== brick);

                                found = true;
                            }
                        }
                        
                        //Fourth Condition//
                        if(currBrick.brick[1] === brick[1] && !found) {
                            if(!((myBoard[row + 1]) && (myBoard[row + 1][column].occupied)) && currBrick.direction === "vertical") {
                                brickToInsert.brick = [brick[1], brick[0]];
                                if(!myBoard[row + 1]) {
                                    let newLine = [];
                                    for(let i = 0 ; i < myBoard[0].length ; i++) {
                                        newLine.push({occupied: false})
                                    } 
                                    myBoard.push(newLine);
                                }
                                if(brick[0] === brick[1]) {
                                    brickToInsert.direction = "horizontal";
                                }
                                else {
                                    brickToInsert.direction = currBrick.direction;
                                }
                                
                                brickToInsert.position.column = currBrick.position.column;
                                brickToInsert.position.row = currBrick.position.row + 1;
                                myBoard[brickToInsert.position.row][brickToInsert.position.column] = brickToInsert;
                                player1Deck = player1Deck.filter((item) => item !== brick);
                                
                                found = true;
                            }
                            
                            //Eighth Condition//
                            else if(!((myBoard[0][column - 1]) && (myBoard[row][column - 1].occupied)) && currBrick.direction === "horizontal" && !found) {
                                brickToInsert.brick = [brick[1], brick[0]];
                                if(!myBoard[0][column - 1]) {
                                    for(let i = 0 ; i < myBoard.length ; i++) {
                                        myBoard[i].unshift({occupied: false});
                                        for(let j = 0 ; j < myBoard[i].length ; j++) {
                                            if(myBoard[i][j].occupied) {
                                                myBoard[i][j].position.column++; //changing
                                            }
                                        } 
                                    } 
                                }
                                if(brick[0] === brick[1]) {
                                    brickToInsert.direction = "vertical";
                                }
                                else {
                                    brickToInsert.direction = currBrick.direction;
                                }
                                
                                brickToInsert.position.row = currBrick.position.row;
                                brickToInsert.position.column = currBrick.position.column - 1;
                                myBoard[brickToInsert.position.row][brickToInsert.position.column] = brickToInsert;
                                player1Deck = player1Deck.filter((item) => item !== brick);
                                
                                found = true;
                            }
                        } 
                    }
                }
            }
        }

        return({myBoard: myBoard,
            player1Deck: player1Deck
        })
    }

    isLegalDraw() {
        //return true;
        
        let canDrawTile = true;
        for (const tile of this.state.player1Deck) {
           if(this.isLegalMove(tile)) {
            canDrawTile = false;
            break;
        }
    }
        return canDrawTile;
    }

    saveCurrentStateForHistory() {
        let myHistory = this.state.history; 
        let savedHistory =this.getCurrentGameState();

        myHistory.push(savedHistory);
        this.setState(() => {
            return {
                history: myHistory,
            }
        })
    }

    saveCurrentStateForNext() {
        let myNext = this.state.next; 
        let savedNext = this.getCurrentGameState();

        //if(this.state.next.length !== 0) {
            myNext.push(savedNext);
            this.setState(() => {
                return {
                    next: myNext,
                }
            })
       // }
    }

    updateStatsAfterMove(moveWasDraw) { // make sure to save History before calling this function 
        let stats = this.state.player1Stats;
        let playerHand = this.deepClone(this.state.myBoard);
        stats.Update(playerHand, moveWasDraw);
        this.setState(() => {
            return {
                player1Stats: stats,
            }
        })
    }
    
    handleDrawClick() {
        if(this.state.myPile.length === 0) {
            this.setState(() => {
                return {
                    isPileEmpty: true,
                    isCheckEndGame: true
                }
            })
            return;
        }
        else {
            this.setState(() => {
                return {
                    isPileEmpty: false
                }
            })
        }

        if(!this.isLegalDraw()) {
            return;
        }

        this.saveCurrentStateForHistory();

        let playerDeck = this.state.player1Deck;
        let myPile = this.state.myPile;
        
        let randomIndex = Math.floor(Math.random() * myPile.length);
        playerDeck.push(myPile[randomIndex]);
        myPile = myPile.filter((item, j) => j !== randomIndex);

        this.setState(() => {
            return {
                myPile: myPile,
                player1Deck: playerDeck,
            }
        })

        if(this.checkLeftValidMoves()) {
            this.setState({isLeftMoves: "yes-moves"})
        };

        this.updateStatsAfterMove(true);
        this.nextTurn();
    }

    handleUndoClick() {
        this.doUndo();
    }

    handleNextClick() {
        this.doNext();
    }

    handlePrevClick() {
        this.doPrev();
    }

    doNext() {
        if(this.state.next.length < 1) {
            return;
        }

        this.saveCurrentStateForHistory();
        let next =  this.state.next.pop();
        this.setState({
            numOfPlayers: next.numOfPlayers, 
            isGameStarted: next.isGameStarted,
            player1Deck: next.player1Deck,
            boardBricks: next.boardBricks,  
            playerDeck: next.playerDeck,
            myBoard: next.myBoard,
            myPile: next.myPile,
            player1Stats: next.player1Stats,
        });
    }

    doPrev() {
        if(this.state.history.length <= 1) {
            return;
        }

        this.saveCurrentStateForNext();
        this.doUndo();
    }

    handleTimer(info) {
        this.setState(() => {
            return {
                isTimerStarted: info.isTimerStared
            };
        });
    }

    render() {
        const myPopup = <Popup text={this.state.popupMessage} 
                        togglePopup={this.togglePopup}
                        stats={this.state.player1Stats}
                        handleNextClick={this.handleNextClick}
                        handlePrevClick={this.handlePrevClick} />

        const myDeck = <Deck 
                        handleClickedBrick={this.handleClickedBrick} 
                        handleMouseOver={this.handleMouseOver}
                        handleMouseOut={this.handleMouseOut}
                        myDeck={this.state.player1Deck} 
                        selectedBrick={this.state.selectedBrick}
                        />

        const myBoard = <Board 
                        isTimerStarted={this.state.isTimerStarted}
                        myBoard={this.state.myBoard}
                        status2={this.state.isGameEnded}
                        //handleDrop={this.handleDrop}
                        />
        
        return (
            <div className="domino-game">
                <div className="body">
                    <div className="board-container" 
                            onDrop={this.handleDrop} 
                            onDragOver={this.handleDragOver}>
                        {this.state.isGameStarted ? myBoard : null }
                    </div>
                    <div className="right-nav">
                        <GameTimer isTimerStarted={this.state.isTimerStarted} />
                        <Control func={this.handleGame}/>
                        <div className="draw">
                            {this.state.isPileEmpty ? <p>No more bricks!</p> : null}
                            <button className="my-button" 
                                onClick={this.handleDrawClick}
                                status={this.state.isLeftMoves}>Draw</button>
                        </div>
                        <div>
                            <button className="my-button" onClick = {this.handleUndoClick}>Undo</button>
                        </div>
                        {this.state.isGameStarted ? myDeck : null}
                    </div>
                </div>
                {this.state.isCheckEndGame ? this.checkEndGame() : null}
                {this.state.isGameEnded ? myPopup : null}
            </div>
        );
    }
}

export default App;

