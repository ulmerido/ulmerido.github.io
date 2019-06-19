import React, {Component} from "React";
import HalfBrick from "./HalfBrick";

import "./DominoBrick.css";

class DominoBrick extends Component {
    constructor(props) {
        super(props);
        this.state = {

        };

        this.handleClickedBrick = this.handleClickedBrick.bind(this);
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
    }

    handleClickedBrick() {
        this.props.handleClickedBrick(this.props.numbers);
    }

    handleMouseOver() {
        this.props.handleMouseOver(this.props.numbers);
    }

    handleMouseOut() {
        this.props.handleMouseOut(this.handleMouseOut);
    }

    render() {
        return (
            <div status={this.props.status} 
                onMouseOver={this.handleMouseOver} 
                onMouseOut={this.handleMouseOut}
                onClick={this.handleClickedBrick} 
                className={`${this.props.numbers[0]}${this.props.numbers[1]} domino-brick`}>
                <HalfBrick className={`brickT${this.props.numbers[0]} top`} 
                            position="top" 
                            number={/*this.props.upSideDown ? this.props.numbers[1] : */this.props.numbers[0]}/>
                <span className="domino-line" />
                <HalfBrick className={`brickB${this.props.numbers[1]} bottom`} 
                            position="bottom" 
                            number={/*this.props.upSideDown ? this.props.numbers[0] : */this.props.numbers[1]}/>
                
            </div>
        );
    }
}


export default DominoBrick;