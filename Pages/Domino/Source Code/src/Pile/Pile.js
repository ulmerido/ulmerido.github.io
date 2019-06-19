import React, {Component} from "react";
//import DominoBrick from "../DominoBrick/DominoBrick";

import "./Pile.css";

class Pile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            myPile: [
                        [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
                        [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [2, 2], 
                        [2, 3], [2, 4], [2, 5], [2, 6], [3, 3], [3, 4], [3, 5], 
                        [3, 6], [4, 4], [4, 5], [4, 6], [5, 5], [5, 6], [6, 6],
                    ],

            playerDeck: [],
        };
    }

    componentDidMount() {
        let playerDeck = [];
        let myPile = this.state.myPile;

        for(let i = 0 ; i < 6 ; i++) {
            let randomIndex = Math.floor(Math.random() * myPile.length);
            playerDeck.push(myPile[randomIndex]);
            myPile = myPile.filter((item, j) => j !== randomIndex);
        }

        this.setState(() => {
            return {
                myPile,
                playerDeck: playerDeck,
            }
        })

        this.props.func(playerDeck);
    }

    render() {
        return (
            <div className="draw">
                <button className="my-button">Draw</button>
            </div>
        )
    
    }
}


export default Pile;