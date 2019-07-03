import React from "react";
import Stats from "./Stats/Stats";
import "./Popup.css";

class Popup extends React.Component {
    render() {
      return (
        <div className='popup'>
          <div className='popup_inner'>
            <h1>{this.props.text}</h1>
            <div className="popup-inner-content">
                <div className="popup-buttons">
                    <button className="my-button" onClick={this.props.togglePopup}>Redo From Here</button>
                    <div className="history-buttons">
                        <button className="my-button" onClick={this.props.handlePrevClick}>Previous</button>
                        <button className="my-button" onClick={this.props.handleNextClick}>Next</button>
                    </div>
                </div>
                <div className="stats-container">
                    <Stats stats={this.props.stats}/>
                </div>
            </div>
          </div>
        </div>
      );
    }
  }

export default Popup;