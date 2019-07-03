import React, {Component} from "react";
import DominoBrick from "../DominoBrick/DominoBrick";

import "./Deck.css";

class Deck extends Component {
    constructor(props) {
        super(props);
        this.state = {
            myDeck: props.myDeck,
            isGameStarted: props.isGameStarted,
        };

        this.handleClickedBrick = this.handleClickedBrick.bind(this);
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
        this.selectedBrick = this.selectedBrick.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if(nextProps.isGameStarted !== prevState.isGameStarted)
        {
            return {
                isGameStarted: !prevState.isGameStarted
            };
        }

        return null;
    }

    handleClickedBrick(brick) {
        this.props.handleClickedBrick(brick);
    }

    handleMouseOver(brick) {
        this.props.handleMouseOver(brick);
    }

    handleMouseOut() {
        this.props.handleMouseOut();
    }

    selectedBrick(brick) {
        if(brick === this.props.selectedBrick.numbers) {
            return (this.props.selectedBrick.status);
        }
        else {
            return "neutral";
        }
    }

    handleDrop(e, con) {
        this.props.handleDrop(e, con);
    }

    render() {
        const pickedUpBricks = this.props.myDeck.map(brick => <DominoBrick 
            handleClickedBrick={this.handleClickedBrick}
            handleMouseOver={this.handleMouseOver}
            handleMouseOut={this.handleMouseOut}
            handleDrop={this.handleDrop}
            numbers={brick}
            isDeckBrick={true}
            status={this.selectedBrick(brick)}
            key={`brick${brick[0]}${brick[1]}`} 
            />)
        
        return (
            <div className="deck">
                {pickedUpBricks}
            </div>
        )
    
    }
}


export default Deck;