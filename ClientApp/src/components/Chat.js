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

        const nick = this.props.nick;

        const hubConnection = new signalR.HubConnectionBuilder().withUrl("/chatter").build(); // Create Hub Connection

        // Set up Hubconnection / nickname in state
        this.setState({ hubConnection, nick }, () => { 
            this.state.hubConnection
                .start()
                .then(() => console.log('Connection started!'))
                .catch(err => console.log('Error establishing connection'));


            // On recieving 'sendToAll' message, create sent message and append it to messages state.
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
        // On update, set the scrollbar of the chat window to the bottom
        const objDiv = document.getElementById("window");
        objDiv.scrollTop = objDiv.scrollHeight;
    }

    changeHandle = (e) => {
        // Handle typing from user
        this.setState({ message: e.target.value });
    }

    sendMessage = (e) => {
        e.preventDefault();
        // On triggering sendMessage() invoke the hubconnection and 'sendToAll'. This message gets pushed to the Hub and then pushed to all clients connected to the hub.
        this.state.hubConnection
            .invoke('sendToAll', this.state.nick, this.state.message)
            .catch(err => console.error(err));

        this.setState({ message: '' }); // Reset the 'message entering box' / chat form input
    }
    render() {

        return (
            <div className="chat">
                <div id="window">  {/*Message Window*/}
                    {this.state.messages.map((message, index) => (
                        <span style={{ display: 'block' }} key={index}> {message} </span>
                    ))}

                </div>
                <br />
                <form onSubmit={this.sendMessage}>
                    <input id="chatform" type="text" autoComplete="off"
                        value={this.state.message}
                        onChange={this.changeHandle}/>
                    <button type="submit">Send</button>
                </form>

                

            </div>
        )
    }
}

export default Chat;