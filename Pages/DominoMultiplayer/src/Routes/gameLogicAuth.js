const gameAuth = require('./gameAuth');
const gameLogic = require('../Logic/Game/Game');

const gamesLogicList = {};

//MIDDLEWARE FUNCS
function initGame(req, res, next) 
{
    const newGameReq = JSON.parse(req.body);
    const gameName = newGameReq.gameName;
    const playersArr = newGameReq.players;
    const numPlayers = playersArr.length;

    if(gamesLogicList[gameName] === undefined) {
        gamesLogicList[gameName] = gameLogic.create(numPlayers, playersArr, gameName);
    }

    next();
}

function getGameStatus(gameName, userName) {
    if(gameAuth.gameAuthentication(gameName) === false) {
        return null;
    } 
    else {
        return gamesLogicList[gameName].GetGameState(userName);
    }
}

function isLegalMove(req, res, next) {
    const parsedReq = JSON.parse(req.body);
    const gameName = parsedReq.gameName;
    const brick = parsedReq.brick;

    if(gamesLogicList[gameName].IsLegalMove(brick) === true ){
        next();
    } else {
        res.sendStatus(403);
    }
}

function addBrick(req, res, next) {
    const parsedReq = JSON.parse(req.body);
    const gameName = parsedReq.gameName;
    const userName = parsedReq.userName;
    const brick = parsedReq.brick;
    gamesLogicList[gameName].AddBrickToBoard(brick, userName);
    next();
}

function isLegalDraw(req, res, next) {
    const parsedReq = JSON.parse(req.body);
    const gameName = parsedReq.gameName;
    const userName = parsedReq.userName;
    
    if(gamesLogicList[gameName].IsLegalDraw(userName) === true ) {
        next();
    } else {
        res.sendStatus(403);
    }
}

function executeADraw(req, res, next) {
    const parsedReq = JSON.parse(req.body);
    const gameName = parsedReq.gameName;
    gamesLogicList[gameName].ExecuteADraw();
    next();
}

function restartGameLogic(gameName) {
    if(gamesLogicList[gameName] !== undefined){
        gamesLogicList[gameName] = undefined;
    }
}

module.exports = {restartGameLogic, executeADraw, isLegalDraw, isLegalMove, addBrick, getGameStatus, initGame,gamesLogicList}

