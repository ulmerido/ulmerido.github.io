import React, {Component} from "React";
import "./Stats.css";

//import AverageTime from "./Stats-Components/AverageTime/AverageTime";
//import DrawCounter from "./Stats-Components/DrawCounter/DrawCounter";
import GameTimer from "./Stats-Components/GameTimer/GameTimer";
//import Score from "./Stats-Components/Score/Score";
//import TurnCounter from "./Stats-Components/TurnCounter/TurnCounter";

class Stats extends Component {
    constructor(props) {
        super(props);
        this.state = {
        
        };
    }

    render() {
        return (
            <div className="stats">
                <GameTimer isGameStarted={this.props.isGameStarted}/>
            </div>
        );
    }
}

export default Stats;
