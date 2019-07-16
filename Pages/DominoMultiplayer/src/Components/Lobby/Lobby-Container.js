import React, {Component} from "react";
import GamesArea from "./Games-Area";
import UserList from "./Users-List";
import GameEntryForm from "./Game-Entry-Form";
import DominoLogo from "../../domino.png"
import GameContainer from "./Game-Container";
import "./Lobby-Container.css";
import {invalidMessage} from "../Popup/MessagePopup";

class LobbyContainer extends Component{
    constructor(props) {
        super(props);
        this.state = {
            showNewGameForm: true,
            watchGame: false,
            joinedGame: false,
            userName: props.name,
            currentGameName: ""
        };
    }

    render(){
        if(this.state.joinedGame === false && this.state.watchGame === false) {
            return(
                <div className="lobby-container">
                    {<img className="logo" src={DominoLogo}></img>}
                    <button className="util btn" id="logoutBtn" onClick={this.props.logoutHandler}></button>
                    <UserList />
                    {this.state.showNewGameForm ? 
                    <GameEntryForm newGameEntryHandler={this.newGameEntryHandler.bind(this)}/> : null}
                    <GamesArea userName={this.state.userName}
                               joinGameHandler={this.joinGameHandler.bind(this)}
                               removeGameHandler={this.removeGameHandler.bind(this)}
                               watchGameHandler={this.watchGameHandler.bind(this)}
                               key={this.state.userName}
                    />
                </div>
            )
        } else if(this.state.joinedGame === true) {
            return (
                    <GameContainer userName={this.state.userName}
                                   gameName={this.state.currentGameName}
                                   playerStatus={"waiting"}
                                   leaveGameHandler={this.leaveGameHandler.bind(this)} />
            )
        } else if(this.state.watchGame === true) {
            return (
                    <GameContainer username={this.state.username}
                                   gameName={this.state.currentGameName}
                                   playerStatus={"spectator"}
                                   leaveGameHandler={this.leaveGameHandler.bind(this)} />
                    
            )
        }
    }

    newGameEntryHandler(e) {
        e.preventDefault();

        const gameName = e.target.elements.name.value;
        const playersNum = e.target.elements.playersNum.value;

        fetch("/games/addGame", {
            method: "POST",
            body: JSON.stringify({gameName: gameName, 
                                  playersNum: playersNum, 
                                }),
            credentials: "include"})
        .then(response => {
            if (!response.ok) {
                throw response;
            }
            this.setState(() => ({showNewGameForm:false}));
        })
        .catch(() => {
            invalidMessage("Game name already exist");
        });
        return false;
    }

    joinGameHandler(game) {
        fetch("/games/joinGame", {
            method: "POST",
            body: JSON.stringify({gameName: game}),
            credentials: "include"
        })
        .then(response => {
            if (!response.ok) {
                throw response;
            } else {
                this.setState(() => ({joinedGame: true , currentGameName: game}));
            }
        })
        .catch(err => {
            throw err;
        });
    }

    removeGameHandler(game) {
        fetch("/games/removeGame", {
            method: "POST",
            body: JSON.stringify({gameName: game}),
            credentials: "include"
        })
            .then(response => {
                if (!response.ok) {
                    throw response;
                } else {
                    this.setState(() => ({showNewGameForm: true}));
                }
            })
            .catch(err => {
                throw err;
            });
    }

    watchGameHandler(game) {
        fetch("/games/watchGame", {
            method: "POST",
            body: JSON.stringify({gameName: game}),
            credentials: "include"
        })
            .then(response => {
                if (!response.ok) {
                    throw response;
                } else {
                    this.setState(() => ({watchGame: true , currentGameName: game}));
                }
            })
            .catch(err => {
                throw err;
            });
    }

    leaveGameHandler(game) {
        fetch("/games/leaveGame", {
            method: "POST",
            body: JSON.stringify({gameName: game}),
            credentials: "include"
        })
            .then(response => {
                if (!response.ok) {
                    throw response;
                } else {
                    if(this.state.joinedGame === true) {
                        this.setState(() => ({joinedGame: false , currentGameName: ""}));
                    } else { //watch game
                        this.setState(() => ({watchGame: false , currentGameName: ""}));
                    }
                }
            })
            .catch(err => {
                throw err;
            });
    }
}

export default LobbyContainer;