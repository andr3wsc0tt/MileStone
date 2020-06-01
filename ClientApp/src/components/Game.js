import React, { Component, Fragment } from 'react';
import * as signalR from '@aspnet/signalr';
import { Redirect, Link, BrowserRouter as Router } from 'react-router-dom';
import { Home } from './Home';
import Chat from './Chat';

class Game extends Component {
    constructor(props) {
        super(props);

        this.state = {
            player: '',
            players: [],
            hubConnection: null,
        };

        this.canvasRef = React.createRef();

        this.movement = {
            up: false,
            down: false,
            left: false,
            right: false
        }    
    }

    componentDidMount = () => {

        if (sessionStorage.getItem("loggedIn") != 'true') {
            return;
        }

        const hubConnection = new signalR.HubConnectionBuilder().withUrl("/gameServer").build();

        this.setState({ hubConnection}, () => {
            this.state.hubConnection
                .start()
                .then(() => {
                    console.log('Connection started!');
                    this.state.hubConnection.invoke('NewPlayer');
                    setInterval(() => {
                        this.state.hubConnection.invoke('Movement', this.movement);
                    }, 1000 / 60);
                })
                .catch(err => console.log('Error establishing connection'));

            this.state.hubConnection.on('state', (players) => {
                const canvas = this.canvasRef.current;
                canvas.width = 600;
                canvas.height = 400;
                const context = canvas.getContext("2d");
                context.clearRect(0, 0, 600, 400);
                var playersObj = JSON.parse(players);
                for (var id in playersObj) {
                    var player = playersObj[id];
                    context.beginPath();
                    context.arc(player.x, player.y, 10, 0, 2 * Math.PI);
                    context.fill();
                }
            });


        });

        const canvas = this.canvasRef.current;

        canvas.addEventListener('keydown', (event) => {
            switch (event.keyCode) {
                case 65:
                    this.movement.left = true;
                    break;
                case 87:
                    this.movement.up = true;
                    break;
                case 68:
                    this.movement.right = true;
                    break;
                case 83:
                    this.movement.down = true;
                    break;
            }
        })
        canvas.addEventListener('keyup', (event) => {
            switch (event.keyCode) {
                case 65:
                    this.movement.left = false;
                    break;
                case 87:
                    this.movement.up = false;
                    break;
                case 68:
                    this.movement.right = false;
                    break;
                case 83:
                    this.movement.down = false;
                    break;
            }
        })

    };

    render() {
        if (sessionStorage.getItem("loggedIn") != 'true') {
            console.log("EFF");
            return (
                <Fragment>
                    <Link to="" component={Home} />
                    <Redirect to="./" />
                </Fragment>
            )
        }
        else {
            console.log("PPP");

            return (
                <Fragment>
                    <canvas ref={this.canvasRef} tabIndex="1"></canvas>
                    <Chat nick={sessionStorage.getItem("username")} />
                </Fragment>
            )
        }
    }
}

export default Game;