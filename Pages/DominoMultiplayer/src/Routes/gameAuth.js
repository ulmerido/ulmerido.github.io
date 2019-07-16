const usersAuth = require('./usersAuth');

const gamesList = {};

//MIDDLEWARE FUNCS
function addUserToGame(req, res, next) {
    const gameFromReq = JSON.parse(req.body);
    const userName = usersAuth.getUserNameBySessionId(req.session.id);
    const gameName = gameFromReq.gameName;

    if(gameAuthentication(gameName) === false) {
        //error 409 = CONFLICT
        res.status(409).send("Game name does not exist!");
    }
    else if(gamesList[gameName].players.includes(userName) === true) {
        //error 409 = CONFLICT
        res.status(409).send("You already registered to this game!");
    }
    else {
        gamesList[gameName].players.push(userName);
        updateIfGameReady(gamesList[gameName]);
        next();
    }
}

function restartGameEntry(gameName) {
    if(gamesList[gameName]) {
        if(gamesList[gameName].isActive === true) {
            gamesList[gameName].isActive = false;
            gamesList[gameName].players = [];
            gamesList[gameName].spectators = [];
        }
    }
}

function addSpectatorToGame(req, res, next) {
    const gameFromReq = JSON.parse(req.body);
    const userName = usersAuth.getUserNameBySessionId(req.session.id);
    const gameName = gameFromReq.gameName;

    if(gameAuthentication(gameName) === false) {
        //error 409 = CONFLICT
        res.status(409).send("Game name does not exist!");
    } else {
        gamesList[gameName].spectators.push(userName);
        next();
    }
}

function leaveGame(req, res, next) {
    const gameFromReq = JSON.parse(req.body);
    const userName = usersAuth.getUserNameBySessionId(req.session.id);
    const gameName = gameFromReq.gameName;
    if(gamesList[gameName]) {
        if(gamesList[gameName].players.includes(userName)) {
            //if(gamesList[gameName].isActive === false){
                const userIndex = gamesList[gameName].players.findIndex((user) => {return user === userName});
                gamesList[gameName].players.splice(userIndex, 1);
            //}
        }
        if(gamesList[gameName].spectators.includes(userName)) {
            const userIndex = gamesList[gameName].spectators.findIndex((user) => {return user === userName});
            gamesList[gameName].spectators.splice(userIndex, 1);
        }
    }
    next();
}

function addGameToAuthList(req, res, next) { 
    const gameFromReq = JSON.parse(req.body);
    const playersNum = parseInt(gameFromReq.playersNum);

    if(gameAuthentication(gameFromReq.gameName) === true) {
        //error 409 = CONFLICT
        res.status(409).send("Game name already exist");
    }
    else if(gameFromReq.gameName === "")
    {
        res.status(409).send("Error: Room Name is Empty");
    }
    else 
    {
        gamesList[gameFromReq.gameName] = {
            name: gameFromReq.gameName,
            creator: usersAuth.getUserNameBySessionId(req.session.id),
            playersNum: playersNum,
            isActive: false,
            players: [],
            spectators: []
        };
        next();
    }
}

function removeGameFromAuthList(req, res, next) {
    const gameFromReq = JSON.parse(req.body);
    const gameName = gameFromReq.gameName;
    const userName = usersAuth.getUserNameBySessionId(req.session.id);

    if(gameAuthentication(gameName) === false) {
        //error 409 = CONFLICT
        res.status(409).send("Game name does not exist!");
    }
    else if(gamesList[gameName].creator !== userName) { 
        // error 403 = FORBIDDEN
        res.status(403).send("You cant remove this game!");
    } else {
        gamesList[gameName] = undefined;
        next();
    }
}

//MIDDLEWARE UTILS

function getSpectators(gameName) {
    if(gamesList){
        if(gamesList[gameName]){
            return gamesList[gameName].spectators;
        }
    }
    return [];
}

function removeGameByName(gameName) { delete gamesList[gameName]; }

function getGameInfo(gameName) {  return gamesList[gameName]; }

function gameAuthentication(gameName) { return gamesList[gameName] !== undefined; }

function getGamesList() { return gamesList; }

function updateIfGameReady(gameEntry) {
        if (gameEntry.players.length === gameEntry.playersNum) {
            gameEntry.isActive = true;
        }
}

module.exports = {restartGameEntry, removeGameByName, addSpectatorToGame, getSpectators, gameAuthentication, getGameInfo, leaveGame, getGamesList, addGameToAuthList, removeGameFromAuthList, addUserToGame}
