import React, {Component} from "react";

import "./Control.css";

class Control extends Component {
    constructor(props) {
        super(props);
        this.ref = [];
        this.ref[0] = React.createRef;
        this.ref[1] = React.createRef;
        this.state = {
            isGameStarted: false,
        };

        this.handleStartClick = this.handleStartClick.bind(this);
        this.handleStopClick = this.handleStopClick.bind(this);
    }

    handleStartClick() {
        this.props.func({isGameStarted: true});
        this.setState(() => {
            return {
                isGameStarted: true,
            };
        })
    }

    handleStopClick() {
        this.props.func({isGameStarted: false});
        this.setState(() => {
            return {
                isGameStarted: false,
            }
        })
    }


    render() {
        return (
            <div className="control-buttons">
                <button 
                    className="my-button" 
                    onClick={this.handleStartClick} 
                    disabled={this.state.isGameStarted}>
                    Start</button>
                <button 
                    className="my-button" 
                    onClick={this.handleStopClick} 
                    disabled={!this.state.isGameStarted}>
                    Stop</button>
            </div>
        );
    }
}

export default Control;