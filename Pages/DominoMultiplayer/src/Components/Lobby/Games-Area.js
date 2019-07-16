import React, {Component} from "react";

class GamesArea extends Component {
    constructor(props) {
        super(props);
        this.state = {
            gamesList: [],
            errMessage: ""
        };

        this.getGamesContent = this.getGamesContent.bind(this);
    }

    componentDidMount() {
        this.getGamesContent();
    }

    componentWillUnmount() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }

    render() {
        return(
            <div className="games-area-wrapper">
                {this.state.gamesList.map((game, index) => (
                                                        <div className="gameFrame" key={index}>
                                                            {this.renderGameEntry(game,index)}
                                                        </div>))}
            </div>
        )
    }

    renderGameEntry(game,index){
        const gameName = game.name;
        const gameCreator = game.creator;
        const gameStatus = game.isActive ? "Active" : "Pending";
        const isUserAuthorizedToRemove = game.players.length === 0 && this.props.userName === game.creator;

        return(
            <div id={gameName} className="gameEntry" key={index}>
                <div className="games-area-title">{gameName}</div>
                <p>Creator: {gameCreator}</p>
                <p>Status: {gameStatus}</p>
                <p>Total players: {game.playersNum}</p>
                <p>Registered Players:</p>
                {game.players.map(player => <p>{player}</p>)}
                <p>Spectators:</p>
                {game.spectators.map(spec => <p>{spec}</p>)}
                <button className="util btn gameArea" 
                        value={gameName} 
                        onClick={() => this.props.watchGameHandler(gameName)}>watch</button>
                {game.isActive === false ? 
                <button className="util btn gameArea"
                        value={gameName} 
                        onClick = {() => this.props.joinGameHandler(gameName)}>join</button> : null }

                {isUserAuthorizedToRemove === true && game.isActive === false ? 
                <button className="util btn gameArea"
                        value={gameName} 
                        onClick={() => this.props.removeGameHandler(gameName)}>remove</button> : null }
            </div>
        )
    }

    getGamesContent() {
        return fetch('/games/allGames', {method: 'GET', credentials: 'include'})
        .then(response => {
            if (!response.ok) {
                throw response;
            }
            this.timeoutId = setTimeout(this.getGamesContent, 200);
            return response.json();
        })
        .then(content => {
            let newGameList = [];
            for (let gameName in content) {
                newGameList.push(content[gameName]);
            }
            this.setState(() => ({gamesList: newGameList}));
        })
        .catch(err => {
            throw err
        });
    }
}

export default GamesArea;


