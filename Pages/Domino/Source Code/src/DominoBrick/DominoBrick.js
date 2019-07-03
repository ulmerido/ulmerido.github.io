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
        //this.handleDragStart = this.handleDragStart.bind(this);
    }

    handleClickedBrick() {
        this.props.handleClickedBrick(this.props.numbers);
    }

    handleMouseOver() {
        if(this.props.isDeckBrick) {
            this.props.handleMouseOver(this.props.numbers);
        }
        else {
            return null;
        }
    }

    handleMouseOut() {
        if(this.props.isDeckBrick) {
            this.props.handleMouseOut(this.props.numbers);
        }
        else {
            return null;
        }
    }

    /*
    handleDragStart(e, id) {
        if(this.props.isDeckBrick) {
            console.log("drag start: ", id);
            e.dataTransfer.setData("id", id);
        }
        else {
            return null;
        }
    }
    */

    render() {
        const key = [`${this.props.numbers[0]}`, `${this.props.numbers[1]}`];
        
        return (
            <div status={this.props.status}
                status2={this.props.status2}
                direction={this.props.direction} 
                key={key}
                onMouseOver={this.handleMouseOver}
                onMouseOut={this.handleMouseOut}
                onClick={this.handleClickedBrick} 
                className={`${this.props.numbers[0]}${this.props.numbers[1]} domino-brick`}
                //onDragStart={(e) => this.handleDragStart(e, this.props.numbers)}
                //draggable
                >
                <HalfBrick className={`brickT${this.props.numbers[0]} top`} 
                            position="top" 
                            number={this.props.numbers[0]}/>
                <span className="domino-line" />
                <HalfBrick className={`brickB${this.props.numbers[1]} bottom`} 
                            position="bottom" 
                            number={this.props.numbers[1]}/>
                
            </div>
        );
    }
}


export default DominoBrick;