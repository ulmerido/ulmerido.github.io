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
        if(this.numOfTurns > 1) 
        {      // weird bug when doing numOfTurn > 0 we will get NaN on avgTime
            this.avgTimeOfTurnSeconds = (this.timeFromStartSeconds / this.numOfTurns).toFixed(2);
        }
    }

    GetTimeString() {
        return `${this.timeFromStartSeconds/60}: ${this.timeFromStartSeconds %60}`;
    }
}
class Player {
    constructor(i_ID) {
        this.id = i_ID;
        this.Hand = [];
        this.Stats = new Statistics();
        this.UpdateStats = this.UpdateStats.bind(this);
        this.GetClientStats = this.GetClientStats.bind(this);
        this.HandWeight = 0;
        this.UpdateHandWeight = this.UpdateHandWeight.bind(this);
        this.playerRank = -1;
    }

    UpdateStats(i_MoveWasDraw) {
        this.Stats.Update(this.Hand, i_MoveWasDraw);
    }

    GetClientStats() {
        this.UpdateHandWeight()
        return {
            HandWeight: this.HandWeight,
            id: this.id,
            Hand:this.Hand,
            numOfTurns: this.Stats.numOfTurns,                           // 9.1
            timeFromStartSeconds: this.Stats.timeFromStartSeconds,       // 9.2
            avgTimeOfTurnSeconds: this.Stats.avgTimeOfTurnSeconds,       // 9.3   -- TimeFromStart/numOfTurns
            numOfTileDraws: this.Stats.numOfTileDraws,                    // 9.4
            sumOfHandWeight: this.sumOfHandWeight,
            rank: this.playerRank
        };
    }

    UpdateHandWeight() {
        this.HandWeight = 0;
        for(let i = 0; i<this.Hand.length; i++) {
            this.HandWeight += this.Hand[i][0] + this.Hand[i][1];
        }
    }
}

let idNum = 0;
class Game {
    constructor(i_NumOfPlayers, i_PlayerIDArr, i_GameName) {
        //  Class Members
        this.GameID = idNum++;
        this.numOfPlayers = i_NumOfPlayers;
        this.isGameEnded = false;
        this.Players = [new Player(1)];
        this.gameName = i_GameName;
        this.myBoard = [];
        this.playerTurnID = this.Players[0];
        this.playerTurn = 0;
        this.Deck = [];
        this.isActive = true;
        this.WinnerList = [];
        this.numOfPlayersLeft = i_NumOfPlayers;
        this.gameTimer = new StatsTimer();
        this.gameTimer.StartTimer();

        // Private Methods
        this._initDeckAndHands = this._initDeckAndHands.bind(this);
        this._initPlayers = this._initPlayers.bind(this);
        this._isPlayerTurn = this._isPlayerTurn.bind(this);
        this._shuffle = this._shuffle.bind(this);
        this._nextTurn = this._nextTurn.bind(this);
        this._playerHasBrick = this._playerHasBrick.bind(this);
        this._checkEndGame = this._checkEndGame.bind(this);
        this._rmvBrickFromHand = this._rmvBrickFromHand.bind(this);
        this._checkWinner = this._checkWinner.bind(this);
        this._initPlayers(i_PlayerIDArr);
        this._initDeckAndHands();
        
        // Public Methods
        this.AddBrickToBoard = this.AddBrickToBoard.bind(this);
        this.IsLegalMove = this.IsLegalMove.bind(this);
        this.IsLegalDraw = this.IsLegalDraw.bind(this);
        this.GetGameState = this.GetGameState.bind(this);
        this.ExecuteADraw = this.ExecuteADraw.bind(this);
    }

    _checkWinner()
    {
        let winnerIndex = 0;
        let winnerScore = 99999;
        if(!this.isGameEnded) {
            return false;
        }
        else {
            for(let i = 0; i < this.numOfPlayers; i++) {
                if(this.Players[i].playerRank === -1) {
                    this.Players[i].UpdateHandWeight();
                    if(this.Players[i].HandWeight < winnerScore) {
                        winnerIndex = i;
                        winnerScore = this.Players[i].HandWeight;
                    }
                }
            }   
        }

        this.gameTimer.StopTimer();
        this.Players[winnerIndex].playerRank = this.WinnerList.length + 1;
        this.WinnerList.push(this.Players[winnerIndex]);
        return true;
    }

    _initPlayers(i_PlayerIDArr) {
        for(let i = 0; i < this.numOfPlayers; i++) {
            this.Players[i] = new Player(i_PlayerIDArr[i]);
        }

        this.playerTurnID = this.Players[0].id;
    }

    _shuffle() {
        for (let i = this.Deck.length - 1; i > 0; i--) 
        {
            const j = Math.floor(Math.random() * (i + 1));
            [this.Deck[i], this.Deck[j]] = [this.Deck[j], this.Deck[i]];
        }

    }

    _initDeckAndHands() {
        this.Deck = [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
        [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [2, 2], 
        [2, 3], [2, 4], [2, 5], [2, 6], [3, 3], [3, 4], [3, 5], 
        [3, 6], [4, 4], [4, 5], [4, 6], [5, 5], [5, 6], [6, 6],
        ];

        this._shuffle();

        for(let i = 0; i < this.numOfPlayers; i++) {
            for(let j = 0 ; j < 6 ; j++) {
                this.Players[i].Hand.push(this.Deck.pop());
            }
        }
    }

    _isPlayerTurn(id) {
        return this.playerTurnID === id;
    }

    _nextTurn(moveWasDraw) {

        this._checkEndGame();
        this.Players[this.playerTurn].UpdateStats(moveWasDraw);
        this.Players[this.playerTurn].Stats.TurnEnd();
        this.playerTurn = (++this.playerTurn) % this.numOfPlayers;
        if(this.Players[this.playerTurn].playerRank !== -1) { //skip player that finished 
            this.playerTurn = (++this.playerTurn) % this.numOfPlayers;
        }
        
        this.playerTurnID = this.Players[this.playerTurn].id;
        this.Players[this.playerTurn].Stats.TurnStart();

    }

    _checkEndGame() {
        let currPlayer = this.playerTurn;
        let currPlayerID = this.playerTurnID;
        if(this.Players[this.playerTurn].Hand.length === 0) {
           this.numOfPlayersLeft--; 
           this.Players[this.playerTurn].playerRank = this.numOfPlayers - this.numOfPlayersLeft;
           this.WinnerList.push(this.Players[this.playerTurn].GetClientStats());
           if(this.numOfPlayersLeft < 2) { // Game End 
               this.isGameEnded = true; 
           }
        }

        this.playerTurn = (++this.playerTurn) % this.numOfPlayers;
        if(this.Players[this.playerTurn].playerRank !== -1) { //  Skip player that finished
            this.playerTurn = (++this.playerTurn) % this.numOfPlayers;
        }
        
        this.playerTurnID = this.Players[this.playerTurn].id;
        if(this.Deck.length === 0 && this.IsLegalDraw(this.playerTurnID)) { // Game End 
            this.isGameEnded = true;
        }

        this._checkWinner();
        this.playerTurn = currPlayer;
        this.playerTurnID = currPlayerID;
    }

    _rmvBrickFromHand(brick) {
        let playersHand = this.Players[this.playerTurn].Hand;
        for(let i = 0 ; i < playersHand.length; i++) {
            if(playersHand[i][0]==brick[0] && playersHand[i][1] == brick[1]) {
                playersHand.splice(i, 1);
                break;
            }
        }

        this.Players[this.playerTurn].Hand = playersHand;
    }

    _playerHasBrick(brick) {
        for (const tile of this.Players[this.playerTurn].Hand) {
           if(tile[0] === brick[0] && tile[1] === brick[1]) {
                return true;
            }
        }

        return false;
    }

    IsLegalMove(brick) {
        if(this.myBoard.length === 0) {
           return true;
        }

        for(let i = 0 ; i < this.myBoard.length ; i++) {
            for(let j = 0 ; j < this.myBoard[i].length ; j++) {
                let currBrick = this.myBoard[i][j];
                if(currBrick.occupied) {

                    let row = currBrick.position.row;
                    let column = currBrick.position.column;
                    
                    if((currBrick.brick[0] === brick[1]) || (currBrick.brick[0]) === brick[0]) {
                        if(!((this.myBoard[row - 1]) && (this.myBoard[row - 1][column].occupied)) && currBrick.direction === "vertical") {
                            return true;
                        }
                        else if(!((this.myBoard[0][column + 1]) && (this.myBoard[row][column + 1].occupied)) && currBrick.direction === "horizontal" ) {
                            return true;
                        }
                        if(currBrick.brick[0] === currBrick.brick[1]) {
                            if(!((this.myBoard[row - 1]) && (this.myBoard[row - 1][column].occupied)) && currBrick.direction === "horizontal" ) {
                                return true;
                            }
                            else if(!((this.myBoard[row + 1]) && (this.myBoard[row + 1][column].occupied)) && currBrick.direction === "horizontal") {
                                return true;
                            }
                            else if(!((this.myBoard[0][column + 1]) && (this.myBoard[row][column + 1].occupied)) && currBrick.direction === "vertical") {
                                return true;
                            }
                            else if(!((this.myBoard[0][column - 1]) && (this.myBoard[row][column - 1].occupied)) && currBrick.direction === "vertical") {
                                return true;
                            }
                        }
                    }

                    if((currBrick.brick[1] == brick[0]) || (currBrick.brick[1] == brick[1])) 
                    {
                        if(!((this.myBoard[row + 1]) && (this.myBoard[row + 1][column].occupied)) && currBrick.direction === "vertical") {
                            return true;
                        }
                        else if(!((this.myBoard[0][column - 1]) && (this.myBoard[row][column - 1].occupied)) && currBrick.direction === "horizontal") {
                            return true;
                        }
                    }
                }   
            }
        }

        return false;
    }

    IsLegalDraw() {
        let canDrawTile = true;
        
        if(this.myBoard.length === 0) {
            canDrawTile = false;
        }
        else {
            for (const tile of this.Players[this.playerTurn].Hand) {
                if(this.IsLegalMove(tile)) {
                    canDrawTile = false;
                    break;
                }
            }   
        }

        return canDrawTile;
    }

    AddBrickToBoard(brick) {
        let found = false;
        let currBrick = null;
        let row = null;
        let column = null;
        let moveWasDraw = false;
        let myBoard = this.myBoard;
        let playersHand = this.Players[this.playerTurn].Hand;
        let brickToInsert = {   
                            brick: brick,
                            direction: "vertical",
                            occupied: true,
                            position:{
                                        row: 0,
                                        column: 0}};
       
        //Zero Condition//
        if(myBoard.length === 0) {
            myBoard.push([brickToInsert]);
            found = true;
        }
        else {
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
                                playersHand = playersHand.filter((item) => item !== brick);

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
                                playersHand = playersHand.filter((item) => item !== brick);
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
                                    playersHand = playersHand.filter((item) => item !== brick);
    
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
                                    playersHand = playersHand.filter((item) => item !== brick);
                                    
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
                                    playersHand = playersHand.filter((item) => item !== brick);
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
                                    playersHand = playersHand.filter((item) => item !== brick);
                                    
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

                                else 
                                {
                                    brickToInsert.direction = currBrick.direction;
                                }

                                brickToInsert.position.row = currBrick.position.row + 1;
                                brickToInsert.position.column = currBrick.position.column;
                                myBoard[brickToInsert.position.row][brickToInsert.position.column] = brickToInsert;
                                playersHand = playersHand.filter((item) => item !== brick);
                                
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
                                playersHand = playersHand.filter((item) => item !== brick);
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
                                    playersHand = playersHand.filter((item) => item !== brick);
                                    found = true;
                                }
                                //////////////////////////////////////////////////////
                                else if(!((myBoard[row - 1]) && (myBoard[row - 1][column].occupied)) && currBrick.direction === "horizontal") {
                                    brickToInsert.brick = [brick[1], brick[0]];
                                    if(!myBoard[row - 1]) {
                                        for(let i = 0 ; i < myBoard.length ; i++){
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
                                    playersHand = playersHand.filter((item) => item !== brick);
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
                                    playersHand = playersHand.filter((item) => item !== brick);
                                    
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
                                    playersHand = playersHand.filter((item) => item !== brick);
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
                                playersHand = playersHand.filter((item) => item !== brick);
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
                                playersHand = playersHand.filter((item) => item !== brick);
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
                                playersHand = playersHand.filter((item) => item !== brick);
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
                                playersHand = playersHand.filter((item) => item !== brick);
                                found = true;
                            }
                        } 
                    }
                }
            }
        }

        this.myBoard = myBoard;
        if(found) {
           this._rmvBrickFromHand(brick);
        }

        this._nextTurn(moveWasDraw);
        return (found);
    }

    ExecuteADraw() {
        let moveWasDraw = true;

        this.Players[this.playerTurn].Hand.push(this.Deck.pop());
        this._nextTurn(moveWasDraw);
        return false;
    }

    GetGameState() {
        let listOfPlayers = [];
        let playersToSend = [];
        for(let i = 0; i < this.numOfPlayers; i++) 
        {
            let id = this.Players[i].id;
            let handSize = this.Players[i].Hand.length;
            listOfPlayers.push({id: id, handSize: handSize});
            playersToSend.push(this.Players[i].GetClientStats());
        }

        let gameState ={
            gameID: this.GameID,
            numOfPlayers: this.numOfPlayers,
            gameEnded: this.isGameEnded,
            listOfPlayers: listOfPlayers,
            players: playersToSend,
            playerTurn: this.playerTurnID,
            deckSize: this.Deck.length,
            board: this.myBoard,
            winnerList: this.WinnerList,
            numOfPlayersLeft: this.numOfPlayersLeft,
            isActive: true,
            timeInSeconds: this.gameTimer.totalSeconds,
        }

        return gameState
    }
}

function create(numPlayers, playersArr, gameName) { return new Game(numPlayers, playersArr, gameName); }

module.exports = {Game, create}

