const express = require('express');
const router = express.Router();
const gamesAuth = require('./gameAuth');
const gamesLogicAuth = require('./gameLogicAuth');
const userAuth = require('./usersAuth');
const gameManagement = express.Router();

//POST ROUTES
gameManagement.post("/addGame", gamesAuth.addGameToAuthList, (req, res) => {
    res.sendStatus(200);
});

gameManagement.post("/removeGame", gamesAuth.removeGameFromAuthList, (req, res) => {
    res.sendStatus(200);
});

gameManagement.post("/joinGame", gamesAuth.addUserToGame, (req,res) => {
    res.sendStatus(200);
});

gameManagement.post("/watchGame", gamesAuth.addSpectatorToGame, (req,res) => {
    res.sendStatus(200);
});

gameManagement.post("/leaveGame", gamesAuth.leaveGame, (req,res) => {
    res.sendStatus(200);
});

gameManagement.post("/gameInfo", (req, res) => {
    const gameName = JSON.parse(req.body).gameName;
    res.json(gamesAuth.getGameInfo(gameName));
});

gameManagement.post("/initGame", gamesLogicAuth.initGame, (req,res) => {
    res.sendStatus(200);
});

gameManagement.post("/gameStatus", (req,res) => {
    const gameName = JSON.parse(req.body).gameName;
    const userName = JSON.parse(req.body).userName;
    const gameStatus = gamesLogicAuth.getGameStatus(gameName, userName);
    if(gameStatus)
    {
        gameStatus.spectators = gamesAuth.getSpectators(gameName);
    }
 
    res.json(gameStatus);
});

gameManagement.post("/restartGame", (req,res) =>{
    const gameName = JSON.parse(req.body).gameName;
    setTimeout(gamesAuth.restartGameEntry, 10000, gameName);
    setTimeout(gamesLogicAuth.restartGameLogic, 10000, gameName);

    res.sendStatus(200);
});

gameManagement.post("/isLegalMove", gamesLogicAuth.isLegalMove, (req,res) => {
    res.sendStatus(200);
});

gameManagement.post("/addBrick", gamesLogicAuth.addBrick, (req,res) => {
    res.sendStatus(200);
});

gameManagement.post("/isLegalDraw", gamesLogicAuth.isLegalDraw, (req,res) => {
    res.sendStatus(200);
});

gameManagement.post("/executeADraw", gamesLogicAuth.executeADraw, (req,res) => {
    res.sendStatus(200);
});

//GET ROUTES
gameManagement.get("/allGames", (req, res) => {
    let theGames = gamesAuth.getGamesList();
    for(gameName in theGames) {
        let game = theGames[gameName];
        if(game) {
            if(userAuth.isUserExist(game.creator) === false && game.players.length === 0 && game.spectators.length === 0) {
                gamesAuth.removeGameByName(gameName);
                theGames = gamesAuth.getGamesList();
            }
        }
    }
    res.json(theGames);
});

module.exports = gameManagement;
