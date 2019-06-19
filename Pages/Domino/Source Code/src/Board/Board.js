import React, {Component} from "react";
import "./Board.css"
import DominoBrick from "../DominoBrick/DominoBrick";

class Board extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isMove: false,
            brickToInsert: null

        };

        this.renderTable = this.renderTable.bind(this);
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if(prevState.isMove !== nextProps.isMove)
        {
            return {
                isMove: !prevState.isMove,
                brickToinsert: nextProps.brickToInsert
            };
        }

        return null;

    }


    renderTable() {
        let myTable = this.props.myBoard;
        console.log(myTable);

        //let value = [];
        return myTable.map(row => {
            return (
                <tr>
                {row.map(column => {
                    if(column.occupied) {
                        return(
                            <td>
                            <DominoBrick status="neutral" numbers={column.brick} upSideDown={column.upSideDown} className={column.direction} />
                            </td>)
                    }
                    else {
                        return(
                        <td></td>)
                    }})}
                </tr>)
            console.log(value);
            return value;
        })
        /*
            <tr>
                { row.map(column => {
                    console.log(column);
                    if(column.occupied) {
                        <td>
                            <DominoBrick numbers={column.brick} className={column.direction} />
                        </td>
                    }
                    else {
                        <td>
                        </td>
                    }
                })}
            </tr>
        })
        console.log(value);
        */
    }

    render() {
        
        return (
            <div className="board">
                <table>
                    <tbody>
                        {this.renderTable()}
                    </tbody>
                </table>
            </div>
        );
    }

}

export default Board