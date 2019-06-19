import React, {Component} from "react";
import "./HalfBrick.css";

class HalfBrick extends Component {
    constructor(props) {
        super(props);
        this.state = {
            number: props.number,
        };

        this.isDominoDot = this.isDominoDot.bind(this);
    }

    isDominoDot(index) {
        switch(this.props.number) {
            case 0:
                return false;
                break;
            
            case 1:
                if(index === 4) {
                    return true;
                }
                break;

            case 2:
                if(index === 2 || index === 6) {
                    return true;
                }
                break;

            case 3:
                if(index === 2 || index === 4 || index === 6) {
                    return true;
                }
                break;
            
            case 4:
                if(index === 0 || index === 2 || index === 6 || index === 8) {
                    return true;
                }
                break;
            
            case 5:
                if (index === 0 || index === 2 || index === 4 || index === 6 || index === 8) {
                    return true;
                }
                break;

            case 6:
                if (index === 0 || index === 3 || index === 6 || index === 2 || index === 5 || index === 8) {
                    return true;
                }    
                break;
        }

        return false;
    }

    render() {
        return (
            <div className={this.props.className + " half-brick"}>
                <table className="dots-table">
                    <tbody>
                        <tr className="board-row">
                            <td>
                                { this.isDominoDot(0) ? <div className="domino-dot"></div> : null }
                            </td>
                            <td>
                                { this.isDominoDot(1) ? <div className="domino-dot"></div> : null }
                            </td>
                            <td>
                                { this.isDominoDot(2) ? <div className="domino-dot"></div> : null }
                            </td>
                        </tr>
                        <tr className="board-row">
                            <td>
                                { this.isDominoDot(3) ? <div className="domino-dot"></div> : null }
                            </td>
                            <td>
                                { this.isDominoDot(4) ? <div className="domino-dot"></div> : null }
                            </td>
                            <td>
                                { this.isDominoDot(5) ? <div className="domino-dot"></div> : null }
                            </td>
                        </tr>
                        <tr className="board-row">
                            <td>
                                { this.isDominoDot(6) ? <div className="domino-dot"></div> : null }
                            </td>
                            <td>
                                { this.isDominoDot(7) ? <div className="domino-dot"></div> : null }
                            </td>
                            <td>
                                { this.isDominoDot(8) ? <div className="domino-dot"></div> : null }
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

export default HalfBrick;