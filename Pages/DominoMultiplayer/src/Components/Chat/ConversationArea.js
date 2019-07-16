import React, {Component} from 'react';

class ConversationArea extends Component {
    constructor() {
        super();
        
        this.state = {
            content: []
        };        

        this.getChatContent = this.getChatContent.bind(this);
    }

    componentDidMount() {
        this.getChatContent();
    }

    componentWillUnmount() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }

    render() {               
        return(
            <div className="conversation-area-wrapper">
                {this.state.content.map((line, index) => (<p key={line.user.name + index}>{line.user.name}:  {line.text}</p>))}
            </div>
        )
    }


    getChatContent() {
        return fetch('/chat/getChat', {
            method: 'POST', 
            body: JSON.stringify({
                gameName: this.props.gameName,
                //userName: this.props.userName
            }),
            credentials: 'include'
        })
        .then((response) => {
            if (!response.ok) {
                throw response;
            }
            this.timeoutId = setTimeout(this.getChatContent, 200);
            return response.json();            
        })
        .then(content => {
            this.setState(() => ({content}));
        })
        .catch(err => {throw err});
    }
}

export default ConversationArea;