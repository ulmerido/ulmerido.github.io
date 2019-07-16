import React, {Component} from "React";
import LoginModal from "./Login-Modal";
import LobbyContainer from "../Lobby/Lobby-Container"

import "./Login.css";

class Login extends Component {
    constructor() {
        super();
        this.state = {
            showLogin: true,
            currentUser: {
                name: ''
            }
        };

        this.handleSuccessfulLogin = this.handleSuccessfulLogin.bind(this);
        this.handleLoginError = this.handleLoginError.bind(this);
        this.fetchUserInfo = this.fetchUserInfo.bind(this);
        this.logoutHandler = this.logoutHandler.bind(this);
        this.getUserName = this.getUserName.bind(this);
        //this.getUserName();
    }

    render() {        
        if (this.state.showLogin || this.state.currentUser.name === '') {
            return (<LoginModal 
                    loginSuccessHandler={this.handleSuccessfulLogin} 
                    loginErrorHandler={this.handleLoginError}/>)
        } else {
            return this.renderLobby();
        }
    }

    renderLobby() {
        return (
            <div className="lobby-base-container">
                <LobbyContainer name={this.state.currentUser.name} logoutHandler={this.logoutHandler}/>
            </div>
        )
    }

    handleSuccessfulLogin() {
        this.setState(() => ({showLogin:false}), this.getUserName);
    }

    handleLoginError() {
        this.setState(() => ({showLogin:true}));
    }

    getUserName() {
        this.fetchUserInfo()
        .then(userInfo => {
            this.setState(() => ({currentUser:userInfo, showLogin: false}));
        })
        .catch(err => {            
            //error 401 = UNAUTHORIZED
            if (err.status === 401) {
                this.setState(() => ({showLogin: true}));
            } else {
                throw err;
            }
        });
    }

    fetchUserInfo() {        
        return fetch('/users', {method: 'GET', credentials: 'include'})
        .then(res => {            
            if (!res.ok) {
                throw res;
            }
            return res.json();
        });
    }

    logoutHandler() {
        fetch('/users/logout', {method: 'GET', credentials: 'include'})
        .then(res => {
            if (!res.ok) {
                //console.log(`failed to logout user ${this.state.currentUser.name} `, res);                
            }
            this.setState(() => ({currentUser: {name:''}, showLogin: true}));
        })
    }
}

export default Login;