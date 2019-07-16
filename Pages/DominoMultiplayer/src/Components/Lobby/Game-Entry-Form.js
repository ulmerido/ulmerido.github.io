import React, {Component} from "react";

class GameEntryForm extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <form className="create-game" onSubmit={this.props.newGameEntryHandler}>
                <div>
                    <h3 className="addGameTitle">Add Game</h3>
                    <input className="addGameText" type="text" name="name" placeholder="Game Name"/>
                </div>
                <div>
                <label className="input-w" htmlFor="playersNum">Participant: </label>
                <select className="input-s" name="playersNum">
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                </select>
                </div>
                <div>
                </div>
                <div>
                    <input
                        type="submit"
                        className="btn"
                        id="submitBtn"
                        value="Submit"
                    />
                </div>
            </form>
        );
    }
}

export default GameEntryForm;