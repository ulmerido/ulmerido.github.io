import React, {Component} from "React";
import "./GameTimer.css";

class GameTimer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isTimerStarted: false,
            isReset: true,
            minutes: "00",
            seconds: "00"
        };

        this.startTimer = this.startTimer.bind(this);
        this.stopTimer = this.stopTimer.bind(this);
    }

    /*
    static getDerivedStateFromProps(props, state) {
        if(props.isGameStarted !== state.isTimerStarted) {
            return {
                isTimerStarted: props.isGameStarted
            };
            
        }
        return null;
    }
*/
    static getDerivedStateFromProps(props, state) {
        if(props.isTimerStarted !== state.isTimerStarted) {
            return {
                isTimerStarted: props.isTimerStarted
            };
            
        }
        return null;
    }
    startTimer() {
        let totalSeconds = 0;
        let tick = function() {
            ++totalSeconds;
            this.setState(() => {
                return {
                    seconds: pad(totalSeconds % 60),
                    minutes: pad(parseInt(totalSeconds / 60)),

                }
            })
        }.bind(this);

        let pad = function(val) {
            let valString = val + "";
            let res = "";
            
            if (valString.length < 2) { 
                res = "0" + valString;
            }
            else {
            res = valString;
            }

            return res;
        }

        this.timer = setInterval(tick, 1000);
        this.setState(() => {
            return {
                isTimerStarted: false,
                isReset: false
            }
        })
    }

    stopTimer() {
        clearInterval(this.timer);
        this.setState(() => {
            return {
                isReset: true,
            };
        })
    }

    render() {
        if(this.state.isTimerStarted && this.state.isReset) {
            this.startTimer();
        }
        if(!this.state.isTimerStarted && !this.state.isReset) {
            this.stopTimer();
        }

        return(    
            <div className="game-timer">
                <h1>{this.state.minutes}:{this.state.seconds}</h1>
            </div>
        );
    }
}

export default GameTimer;