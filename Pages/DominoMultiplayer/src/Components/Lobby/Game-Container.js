import React, {Component} from "react";
import {statusMessage, invalidMessage} from "../Popup/MessagePopup";
import "./Game-Container.css";
import Board from "../Board/Board";
import Deck from "../Deck/Deck";
import ConversationArea from "../Chat/ConversationArea";
import ChatInput from "../Chat/ChatInput";
import DominoBrick from "../DominoBrick/DominoBrick";

const notificationConst = {
    PRE_GAME_STATUS : 'preGameStatus',
    INVALID_MOVE : 'invalidMove',
}

const playerStatusConst = {
    WAITING: 'waiting',
    PLAYING: 'playing',
    SPECTATOR: 'spectator'
};

class GameContainer extends Component{
    constructor(props) {
        super(props);
        this.state = {
            players: [],
            isActive: false,
            playerStatus: props.playerStatus,
            statusMessage: "",
            gameStatus: null,
            selectedBrick: { numbers: [],
                             status: "" }
        };

        this.getGameInfo = this.getGameInfo.bind(this);
        this.initGame = this.initGame.bind(this);
        this.getGameStatus = this.getGameStatus.bind(this);
        this.renderOpp1 = this.renderOpp1.bind(this);
        this.renderOpp2 = this.renderOpp2.bind(this);
        this.renderOpp3 = this.renderOpp3.bind(this);
        this.renderMyHand = this.renderMyHand.bind(this);
        this.renderStatistics = this.renderStatistics.bind(this);
        this.renderGame = this.renderGame.bind(this);
        this.renderChat = this.renderChat.bind(this);
        this.renderGameBoard = this.renderGameBoard.bind(this);
        this.notificationManager = this.notificationManager.bind(this);
        this.renderEndGamePopUp = this.renderEndGamePopUp.bind(this);
        this.restartGame = this.restartGame.bind(this);

        this.handleMouseOut = this.handleMouseOut.bind(this);
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleClickedBrick = this.handleClickedBrick.bind(this);
        this.handleDrawClick = this.handleDrawClick.bind(this);
        this.selectedBrick = this.selectedBrick.bind(this);
    }

    componentWillMount(){
        this.getGameInfo();
    }

    componentWillUnmount() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }

    render() {
        return (
            <div className="game-container">
                {this.state.playerStatus !== playerStatusConst.PLAYING ? 
                <button className="my-button" 
                        value={this.props.gameName} 
                        onClick={() => this.props.leaveGameHandler(this.props.gameName)}>Leave Game</button> : null}
                {this.state.isActive === true ? this.renderGame() : null}
                {this.renderEndGamePopUp()}
            </div>
        )
    }

//----------------------------------------------------RENDERERS---------------------------------------------------------

    renderGame() {
        return (
            <div className="gameBoard-container">
                {this.renderChat()}
                <div className="the-game">
                    {this.renderOpp1()}
                    <div className="center-bar">
                        {this.renderGameBoard()}
                        {this.state.players.length === 3 ? this.renderOpp2() : null }
                    </div>
                    <div className="my-panel">
                        {this.renderTheDeck()}
                        {this.state.playerStatus !== playerStatusConst.SPECTATOR ? this.renderMyHand() : this.renderOpp3() }
                    </div>
                </div>
                <div className="right-panel">
                    {this.renderStatistics()}
                    {this.renderSpectatorList()}
                </div>
            </div>
        )
    }

    renderTheDeck() {
        return (
            <div className="draw">
                <button className="my-button" 
                    onClick={this.handleDrawClick}
                    status={this.state.isLeftMoves}>Draw
                </button>
            </div>
        )
    }

    renderGameBoard() {
        const myBoard = <Board myBoard={this.state.gameStatus.board}/>

        return (
            <div className="domino-game">
                <div className="board-container">
                    {myBoard}
                </div>
            </div>
        )
    }

    renderMyHand() {
        const playerName = this.props.userName;
        const playerIndex = this.state.players.indexOf(playerName);
        const playerHand = this.state.gameStatus.players[playerIndex].Hand;
        const myHand = <Deck 
                        handleClickedBrick={this.handleClickedBrick} 
                        handleMouseOver={this.handleMouseOver}
                        handleMouseOut={this.handleMouseOut}
                        myDeck={playerHand} 
                        selectedBrick={this.state.selectedBrick}
                        />
        return (
            <div className="my-hand-container">
                    <div className="userName"><font color="green">{playerName}</font></div>
                {myHand}
            </div>
        )
    }

    renderOpp1() {
        if(this.state.playerStatus !== playerStatusConst.SPECTATOR) {
            const index = (Math.abs(this.state.players.indexOf(this.props.userName) - 1)) % this.state.players.length;
            const playersHand = this.state.gameStatus.players[index].Hand;
            const playerName = this.state.players[index];
            const opponentDisplay = playersHand.map((brick, index) =>
                <div className="opponent-brick" key={brick}></div>)
            
            return (
                <div className="opponent-1">
                    <div className="opponent-panel1">
                        {opponentDisplay}
                    </div>
                    <div className="userName"><font color="red">{playerName}</font></div>
                </div>
            )
        }
        else {
            const playerName = this.state.gameStatus.players[1].id;
            const pickedUpBricks = this.state.gameStatus.players[1].Hand.map(brick => <DominoBrick 
                handleClickedBrick={this.handleClickedBrick}
                handleMouseOver={this.handleMouseOver}
                handleMouseOut={this.handleMouseOut}
                handleDrop={this.handleDrop}
                numbers={brick}
                isDeckBrick={true}
                status={this.selectedBrick(brick)}
                key={`brick${brick[0]}${brick[1]}`} 
                />)
            
            return (
                <div className="opponent-1">
                    <div className="deck opponent-panel1">
                        {pickedUpBricks}
                    </div>
                    <div className="userName"><font color="red">{playerName}</font></div>
                </div>
            )
        }  
    } 

    renderOpp2() {
        if(this.state.playerStatus !== playerStatusConst.SPECTATOR) {
            let index;

            if(this.state.players.indexOf(this.props.userName) === 1) {
                index = 2;
            }
            else {
                index = (Math.abs(this.state.players.indexOf(this.props.userName) - 2)) % this.state.players.length;
            }

            const playersHand = this.state.gameStatus.players[index].Hand;
            const playerName = this.state.players[index];
            const opponentDisplay = playersHand.map((brick, index) =>
                <div className="opponent-brick" key={brick}></div>)
            return (
                <div className="opponent-2">
                    {opponentDisplay}
                    <div className="userName"><font color="red">{playerName}</font></div>
                </div>
            )
        }
        else {
            const playerName = this.state.gameStatus.players[2].id;
            const pickedUpBricks = this.state.gameStatus.players[2].Hand.map(brick => <DominoBrick 
            handleClickedBrick={this.handleClickedBrick}
            handleMouseOver={this.handleMouseOver}
            handleMouseOut={this.handleMouseOut}
            handleDrop={this.handleDrop}
            numbers={brick}
            isDeckBrick={true}
            status={this.selectedBrick(brick)}
            key={`brick${brick[0]}${brick[1]}`} 
            />)
            
            return (
                <div className="deck2 opponent-2">
                    {pickedUpBricks}
                    <div className="userName"><font color="red">{playerName}</font></div>
                </div>
            )
        } 
    }

    renderOpp3() {
        const playerName = this.state.gameStatus.players[0].id;
        const pickedUpBricks = this.state.gameStatus.players[0].Hand.map(brick => <DominoBrick 
        handleClickedBrick={this.handleClickedBrick}
        handleMouseOver={this.handleMouseOver}
        handleMouseOut={this.handleMouseOut}
        handleDrop={this.handleDrop}
        numbers={brick}
        isDeckBrick={true}
        status={this.selectedBrick(brick)}
        key={`brick${brick[0]}${brick[1]}`} 
        />)
        
        return (
            <div className="opponent-1 my-hand">
                <div className="userName">{playerName}</div>
                <div className="opponent-panel1 deck">
                    {pickedUpBricks}
                </div>
            </div>
        )    
    } 

    renderChat() {
        return (
            <div className="chat-base-container">
                <div className="user-info-area">
                    <font color ="white" >Hello {this.props.userName}</font>
                </div>
                <div className="chat-container">
                    <ConversationArea gameName={this.props.gameName}/>
                    <ChatInput gameName={this.props.gameName} playerStatus={this.state.playerStatus} />
                </div>
            </div>
        )
    }

    renderStatistics() {
        const playerName = this.props.userName;
        const playerIndex = this.state.players.indexOf(playerName);

        return (
            <div className="statistics">
                <div id="statistics-container">
                    <p><b>Game length:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</b>{this.state.gameStatus.timeInSeconds}</p>
                    {this.state.gameStatus.playerTurn !== this.props.userName ? <p>Opponent's Turn:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<font color = "red"><b>{this.state.gameStatus.playerTurn}</b></font></p>
                    : <p>Your Turn:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<font color = "green"><b>{this.state.gameStatus.playerTurn}</b></font></p>}
                    {this.state.playerStatus !== playerStatusConst.SPECTATOR ? <p><b>Average turn time:&nbsp;</b> {this.state.gameStatus.players[playerIndex].avgTimeOfTurnSeconds}</p> : null}
                    {this.state.playerStatus !== playerStatusConst.SPECTATOR ? <p><b>Number of draws:&nbsp;&nbsp;</b> {this.state.gameStatus.players[playerIndex].numOfTileDraws}</p> : null}
                    {this.state.playerStatus !== playerStatusConst.SPECTATOR ? <p><b>Hand Weight:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</b> {this.state.gameStatus.players[playerIndex].HandWeight}</p> : null}
                    {this.state.playerStatus !== playerStatusConst.SPECTATOR ? <p><b>Number of turns:&nbsp;&nbsp; </b>{this.state.gameStatus.players[playerIndex].numOfTurns}</p> : null}
                    {this.state.playerStatus !== playerStatusConst.SPECTATOR ? <p><b>Deck Size:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </b>{this.state.gameStatus.deckSize}</p>: null}

                </div>
            </div> )
    }


    renderSpectatorList() {
        return(
            <div className="statistics">
                <div id="statistics-container">
                    <h3>spectators:</h3>
                    {this.state.gameStatus.spectators.map((user,index) => <div className={"spectator"} key={index}>{user}</div>)}
                </div>
            </div>
        )
    }
    
    renderEndGamePopUp() {
        if(this.state.gameStatus && this.state.isActive === false) {
            const playerName = this.props.userName;
            const playerIndex = this.state.players.indexOf(playerName);
            setTimeout(this.props.leaveGameHandler, 10000, (this.props.gameName));
            this.restartGame();
           
            return (
                <div className="animate popup-container">
                    <div className="popup-container">
                        <h1>Game Summary</h1>
                        <h2>Players Rank</h2>
                        <p>Winner: {this.state.gameStatus.winnerList[0].rank !== "-1" ? this.state.gameStatus.winnerList[0].id : "Draw!"}</p>
                        {this.state.gameStatus.winnerList[0].rank !== "-1" ? this.state.gameStatus.winnerList.map((player,index) => (index !== 0 ? <p key={index+1}>{index+1}: {player.id}</p> : null)) : null}

                    </div>
                    <div className="pop-container summary">
                        <h2>Statistics</h2>
                        <div className="stats-summary">
                            {this.state.gameStatus.players.map((player, index) => 
                            <div key={player.id} className="pop-container">
                                <p>Player Name: {player.id}</p>
                                <p>Time From Start: {player.timeFromStartSeconds}</p>
                                <p>Number Of Turns: {player.numOfTurns}</p>
                                <p>Average Turn Time: {player.avgTimeOfTurnSeconds}</p>
                                <p>Deck Size: {this.state.gameStatus.deckSize}</p>
                                <p>Number Draws: {player.numOfTileDraws}</p>
                            </div>
                            )}
                        </div>
                    </div>
                </div>)
        } else {
            return null;
        }
    }


//----------------------------------------------------HANDLERS----------------------------------------------------------

    handleClickedBrick(brick) {
        if(this.state.isActive === true) {
            if(this.state.gameStatus.playerTurn === this.props.userName) {
                fetch("/games/isLegalMove", {
                    method: "POST",
                    body: JSON.stringify({gameName: this.props.gameName,
                                          userName: this.props.userName,
                                          brick: brick}),
                    credentials: "include"
                })
                .then(response => {
                    if (!response.ok) {
                        this.notificationManager("Invalid Move!", notificationConst.INVALID_MOVE);
                        //throw response;
                    }
                    fetch("/games/addBrick", {
                        method: "POST",
                        body: JSON.stringify({gameName: this.props.gameName,
                                              userName: this.props.userName,
                                              brick: brick}),
                        credentials: "include"
                    })
                    .then(response => {
                    })
                })
            }
            else {
                if(this.state.playerStatus === playerStatusConst.SPECTATOR) {
                    this.notificationManager("You're just a spectator", notificationConst.INVALID_MOVE);
                }
                else {
                    this.notificationManager("It's not your turn", notificationConst.INVALID_MOVE);
                }
            }
        }
    }

    handleMouseOver(brick) {
        if(this.state.isActive === true && this.state.playerStatus !== playerStatusConst.SPECTATOR) {
            if(this.state.gameStatus.playerTurn === this.props.userName) {
                fetch("/games/isLegalMove", {
                    method: "POST",
                    body: JSON.stringify({gameName: this.props.gameName,
                                          brick: brick}),
                    credentials: "include"
                })
                .then(response => {
                    if (!response.ok) {
                        this.setState(() => {
                            return {selectedBrick: {numbers: brick,
                                                    status: "invalid"}
                            }
                        })
                    }
                    else {
                        this.setState(() => {
                            return {selectedBrick: {numbers: brick,
                                                    status: "valid"}
                            }
                        })
                    }
                })
            }
            else {
                this.setState(() => {
                    return {selectedBrick: {numbers: brick,
                                            status: "invalid"}
                    }
                })
            }
        }
        else {
            return;
        }
    }
       
    handleMouseOut() { 
        this.setState(() => {
            return {selectedBrick: {numbers: [],
                                    status: "neutral"}
            }
        })
    }

    handleDrawClick() {
        if(this.state.isActive === true) {
            if(this.state.gameStatus.playerTurn === this.props.userName) {
                if(this.state.gameStatus.deckSize === 0) {
                    this.notificationManager("No more bricks in deck!", notificationConst.INVALID_MOVE);
                }
                else {
                    fetch("/games/isLegalDraw", {
                        method: "POST",
                        body: JSON.stringify({gameName: this.props.gameName}),
                        credentials: "include"
                    })
                    .then(response => {
                        if(!response.ok) {
                            //invalid draw
                            this.notificationManager("Draw is not legal", notificationConst.INVALID_MOVE);
                        }
                        else {
                            fetch("/games/executeADraw", {
                                method: "POST",
                                body: JSON.stringify({gameName: this.props.gameName}),
                                credentials: "include"
                            })
                        }
                    })
                }
            }
            else {
                if(this.state.playerStatus === playerStatusConst.SPECTATOR) {
                    this.notificationManager("You're just a spectator", notificationConst.INVALID_MOVE);
                }
                else {
                    this.notificationManager("It's not your turn", notificationConst.INVALID_MOVE);
                }
            }
        }
    }

    selectedBrick(brick) {
        if(brick === this.state.selectedBrick.numbers) {
            return (this.state.selectedBrick.status);
        }
        else {
            return "neutral";
        }
    }

//--------------------------------------------------GAME-STATUS---------------------------------------------------------

    getGameInfo() {
        return fetch("/games/gameInfo", {
            method: "POST",
            body: JSON.stringify({gameName: this.props.gameName}),
            credentials: "include"
        })
        .then(response => {
            if (!response.ok) {
                throw response;
            }
            return response.json();
        })
        .then(gameInfo => {
            const updatedStatusMessage = this.createStatusMessage(gameInfo);
            if(updatedStatusMessage !== this.state.statusMessage){
                this.notificationManager(updatedStatusMessage, notificationConst.PRE_GAME_STATUS);
            }
            this.setState(() => ({
                players: gameInfo.players,
                statusMessage: updatedStatusMessage
            }));
            if(!gameInfo.isActive){
                this.timeoutId = setTimeout(this.getGameInfo, 200);
            } else {
                this.initGame();
            }
        })
        .catch(err => {
            throw err
        });
    }

    initGame() {
        return fetch("/games/initGame", {
            method: "POST",
            body: JSON.stringify({
                gameName: this.props.gameName,
                players: this.state.players
            }),
            credentials: "include"
        })
        .then((response) => {
            if (!response.ok) {
                throw response;
            }
            if(this.state.playerStatus === playerStatusConst.WAITING){
                this.setState(() => ({playerStatus : playerStatusConst.PLAYING}));
            }
            this.getGameStatus();
        })
        .catch(err => {
            throw err
        });
    }

    getGameStatus() {
        return fetch("/games/gameStatus", {
            method: "POST",
            body: JSON.stringify({
                gameName: this.props.gameName,
                userName: this.props.userName
            }),
            credentials: "include"
        })
            .then((response) => {
                if (!response.ok) {
                    throw response;
                }
                return response.json();
            })
            .then(updatedGameStatus => {
                let updatedPlayerStatus = this.state.playerStatus;
                let playerName, playerIndex, playerHand;

                if (updatedGameStatus.isActive === true) {
                    this.timeoutId = setTimeout(this.getGameStatus, 1000);
                }
                if(this.state.playerStatus !== playerStatusConst.SPECTATOR) {

                    playerName = this.props.userName;
                    playerIndex = this.state.players.indexOf(playerName);
                    playerHand = updatedGameStatus.players[playerIndex].Hand;
                    
                    if(playerHand.length === 0) {
                        updatedPlayerStatus = playerStatusConst.FINISHED_CARDS;
                    }
                    if(updatedGameStatus.gameEnded) {
                        updatedPlayerStatus = playerStatusConst.FINISHED_CARDS;
                    }
                }
                    
                this.setState(() => ({
                    isActive: !updatedGameStatus.gameEnded,
                    gameStatus: updatedGameStatus,
                    playerStatus: updatedPlayerStatus
                }));
            })
            .catch(err => {
                throw err
            });
    }

    restartGame() {
        fetch("/games/restartGame", {
            method: "POST",
            body: JSON.stringify({gameName: this.props.gameName}),
            credentials: "include"
        })
            .then((response) => {
                if (!response.ok) {
                    throw response;
                }
            })
            .catch(err => {
                throw err
            });
    }
    
//----------------------------------------------------UTILITIES---------------------------------------------------------

    createStatusMessage(gameInfo) {
        const playersMissing = gameInfo.playersNum - gameInfo.players.length;

        if(gameInfo.isActive === true){
            return "game on!!!";
        } else if(playersMissing === 1 || (playersMissing === 2 && gameInfo.isCompPlay === true)){
            return "waiting for one more player";
        } else {
            return gameInfo.isCompPlay === true ? `waiting for ${playersMissing - 1} players` : `waiting for ${playersMissing} players`;
        }
    }

    calcPlayerContainerName(playerName) {
        let placeOnBoard;
        const playersNum = this.state.players.length;
        const playerIndex = this.state.players.indexOf(playerName);
        if(playersNum === 2) {
            placeOnBoard = playerIndex === 0 ? 1 : 3;
        }
        else if(playersNum === 3) {
            placeOnBoard = playerIndex === 1 ? 4 : playerIndex + 1;
        }
        return `player${placeOnBoard}-container`;
    }

    notificationManager(notification, notificationType) {
        switch (notificationType) {
            case notificationConst.PRE_GAME_STATUS:
                statusMessage(notification);
                break;
            case notificationConst.INVALID_MOVE:
                invalidMessage(notification);
                break;
        }
    }
}

export default GameContainer;