import React, {Component} from "react";

class UsersList extends Component {
    constructor() {
        super();

        this.state = {
            userList: []
        };
        this.getUserListContent = this.getUserListContent.bind(this);
    }

    componentDidMount() { //after render
        this.getUserListContent();
    }

    componentWillUnmount() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }

    render() {
        return(
            <div className="userList-area-wrpper">
                <ul className={"usersUL"}>
                    <h3 className="userListTitle">Users</h3>
                    {this.state.userList.map((username, index) => (
                        <div key={username + index}>
                            <li>{username}</li>
                        </div>))}
                </ul>
            </div>
        )
    }

    getUserListContent() {
        return fetch('/users/allUsers', {method: 'GET', credentials: 'include'})
            .then((response) => {
                if (!response.ok){
                    throw response; // need to handle err
                }
                this.timeoutId = setTimeout(this.getUserListContent, 200);
                return response.json();
            })
            .then(content => {
                let updatedList = [];
                for (let sessionID in content) {
                    updatedList.push(content[sessionID]);
                }
                this.setState(()=>({userList: updatedList}));
            })
            .catch(err => {throw err});
    }
}

export default UsersList;