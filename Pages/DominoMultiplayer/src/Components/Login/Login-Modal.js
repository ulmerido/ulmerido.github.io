import React, {Component} from "react";
import "./Login-Modal.css";
import {invalidMessage} from "../Popup/MessagePopup";

class LoginModal extends Component {
    constructor() {
        super();
        this.state = {
            errMessage: ""
        }
        this.handleLogin = this.handleLogin.bind(this);        
    }

    render() {
        return (
            <div className="wrapper">
                <div className="container">
                    <h1 className="welcomeTitle">Welcome to Domino Online!</h1>
                    <h3 className="welcomeSubTitle">Please register to enter the game lobby</h3>
                    <form className="form" onSubmit={this.handleLogin}>
                        <input className="username-input" placeholder="Username" name="userName"/>
                        <button className="btn" id="login-button" type="submit" value="Login">Login</button>
                    </form>
                    {this.renderErrorMessage()}

                    <ul className="bg-bubbles">
                        <img src="bricks/brick1.jpg"/>
                        <img src="bricks/brick2.jpg"/>
                        <img src="bricks/brick3.jpg"/>
                        <img src="bricks/brick4.jpg"/>
                        <img src="bricks/brick5.jpg"/>
                        <img src="bricks/brick6.jpg"/>
                        <img src="bricks/brick7.jpg"/>
                        <img src="bricks/brick8.jpg"/>
                        <img src="bricks/brick9.jpg"/>
                        <img src="bricks/brick10.jpg"/>
                        <img src="bricks/brick11.jpg"/>
                        <img src="bricks/brick12.jpg"/>
	                </ul>
                </div>
            </div>
        );
    }

    renderErrorMessage() {
        if (this.state.errMessage) {
            return (
                <div className="login-error-message">
                    {this.state.errMessage}
                </div>
            );
        }
        return null;
    }

    handleLogin(e) {
        e.preventDefault();
        const userName = e.target.elements.userName.value;
        fetch('/users/addUser', {method:'POST', body: userName, credentials: 'include'})
        .then((res) => {            
            if (res.ok){
                this.props.loginSuccessHandler();
            } else {
                if (res.status === 403) {
                    invalidMessage("User name already exist");
                }
                this.props.loginErrorHandler();
            }
        });
        return false;
    }    
}

export default LoginModal;