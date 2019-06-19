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
        console.log(this.props.handleClickedBrick);
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
    render() {
        console.log(this.state.myDeck);
        const pickedUpBricks = this.props.myDeck.map(brick => <DominoBrick 
            handleClickedBrick={this.handleClickedBrick}
            handleMouseOver={this.handleMouseOver}
            handleMouseOut={this.handleMouseOut}
            numbers={brick}
            status={this.selectedBrick(brick)}
            key={`brick${brick[0]}${brick[1]}`} 
            />)
            console.log(pickedUpBricks);
        
        return (
            <div className="deck">
                {pickedUpBricks}
            </div>
        )
    
    }
}


export default Deck;