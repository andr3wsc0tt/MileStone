import React, { Component } from 'react';
import * as signalR from '@aspnet/signalr';

class Chat extends Component {
    constructor(props) {
        super(props);

        this.state = {
            nick: '',
            message: '',
            messages: [],
            hubConnection: null
        };
    }

    componentDidMount = () => {

        console.log("Chat MOUNT");

        const nick = this.props.nick;

        const hubConnection = new signalR.HubConnectionBuilder().withUrl("/chatter").build();

        this.setState({ hubConnection, nick }, () => {
            this.state.hubConnection
                .start()
                .then(() => console.log('Connection started!'))
                .catch(err => console.log('Error establishing connection'));

            this.state.hubConnection.on('sendToAll', (nick, receivedMessage) => {
                const text = `${nick}: ${receivedMessage}`;
                const messages = this.state.messages.concat([text]);
                this.setState({ messages });
            });
        });
    };

    componentWillUnmount = () => {

        console.log("Chat UNMOUNT");
    }

    componentDidUpdate = () => {
        const objDiv = document.getElementById("window");
        objDiv.scrollTop = objDiv.scrollHeight;
    }

    changeHandle = (e) => {
        this.setState({ message: e.target.value });
    }

    sendMessage = (e) => {
        e.preventDefault();
        this.state.hubConnection
            .invoke('sendToAll', this.state.nick, this.state.message)
            .catch(err => console.error(err));

        this.setState({ message: '' });
    }
    render() {

        return (
            <div className="chat">
                <div id = "window">
                    {this.state.messages.map((message, index) => (
                        <span style={{ display: 'block' }} key={index}> {message} </span>
                    ))}

                </div>
                <br />
                <form onSubmit={this.sendMessage}>
                    <input id="chatform" type="text"
                        value={this.state.message}
                        onChange={this.changeHandle}/>
                    <button type="submit">Send</button>
                </form>

                

            </div>
        )
    }
}

export default Chat;