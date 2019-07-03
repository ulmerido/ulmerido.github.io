import React, {Component} from "React";
import "./Stats.css";

//import AverageTime from "./Stats-Components/AverageTime/AverageTime";
//import DrawCounter from "./Stats-Components/DrawCounter/DrawCounter";
//import Score from "./Stats-Components/Score/Score";
//import TurnCounter from "./Stats-Components/TurnCounter/TurnCounter";

class Stats extends Component {
    constructor(props) {
        super(props);
        this.state = {
        
        };
    }

    render() {
        console.log(this.props.stats);
        return (
            <div className="stats">
                <p>Score: {this.props.stats.sumOfHandWeight}</p>
                <p>Average Time: {this.props.stats.avgTimeOfTurnSeconds}</p>
                <p>Number of draws: {this.props.stats.numOfTileDraws}</p>
                <p>Turns: {this.props.stats.numOfTurns}</p>
            </div>
        );
    }
}

export default Stats;
