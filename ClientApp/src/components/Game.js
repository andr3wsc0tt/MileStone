import React, { Component, Fragment } from 'react';
import * as signalR from '@aspnet/signalr';
import { Redirect, Link, BrowserRouter as Router } from 'react-router-dom';
import { Home } from './Home';
import Chat from './Chat';

class Game extends Component {

    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            player: '',
            players: [],
            hubConnection: null,
            myString: '',
            myScore: 0,
            canvasWidth: 0,
            canvasHeight: 0
        };

        this.interval = null;
        this.canvasRef = React.createRef();

        this.movement = {
            up: false,
            down: false,
            left: false,
            right: false,
            space: false
        }    
    }


    componentWillUnmount = () => {

        if (sessionStorage.getItem("loggedIn") != 'true') {
            return;
        }

        console.log("UNMOUNT");
        console.log(this.state.hubConnection);
        if (this.state.hubConnection) {
            this.state.hubConnection.stop();
            clearInterval(this.interval);
        }
    }

    componentDidMount = () => {

        if (sessionStorage.getItem("loggedIn") != 'true') {
            return;
        }

        console.log("MOUNT");

        const hubConnection = new signalR.HubConnectionBuilder().withUrl("/gameServer").build();

        var alive = true;

        this.setState({ hubConnection}, () => {
            this.state.hubConnection
                .start()
                .then(() => {
                    console.log('Connection started!');
                    this.state.hubConnection.invoke('NewPlayer')
                        .then((initClass) => {
                            var json =  JSON.parse(initClass);
                            this.setState({ myString: json.connectionId, canvasHeight: json.canvasHeight, canvasWidth: json.canvasWidth });

                        })
                    this.interval = setInterval(() => {
                        if (alive == false) {
                            var data = { Username: sessionStorage.getItem("username"), Highscore: this.state.myScore }
                            this.addScore(data);
                            clearInterval(this.interval);
                        }
                        this.state.hubConnection.invoke('Movement', this.movement);
                    }, 1000 / 60);
                })
                .catch(err => console.log('Error establishing connection'));

            this.state.hubConnection.on('state', (players) => {
                const canvas = this.canvasRef.current;
                canvas.width = this.state.canvasWidth;
                canvas.height = this.state.canvasHeight;
                const context = canvas.getContext("2d");
                var playersObj = JSON.parse(players);
                for (var id in playersObj) {
                    var player = playersObj[id];
                    var color = "black";
                    if (id == this.state.myString) {
                        color = "red";
                        this.state.myScore = player.score;
                    }
                    if (player.hp > 0) {
                        this.drawMe(context, player.ax, player.ay, player.bx, player.by, player.cx, player.cy, color);
                    }
                    else if (player.death < 250) {
                        this.explodeMe(context, player.x, player.y, player.death, color);
                        if (id == this.state.myString) {
                            alive = false;
                        }
                    }

                    for (var bul in player.bullets) {
                        this.drawBullet(context, player.bullets[bul].x, player.bullets[bul].y);
                    }
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
                case 32:
                    this.movement.space = true;
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
                case 32:
                    this.movement.space = false;
                    break;
            }
        })

    };

    drawMe = (ctx, ax, ay, bx, by, cx, cy, color = "black") => {

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.lineTo(cx, cy);
        ctx.fill();
    }

    explodeMe = (ctx, x, y, death, color) =>{
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.rect(x - death, y + death, 10, 10);
        ctx.rect(x + death, y + death, 10, 10);
        ctx.rect(x + death, y - death, 10, 10);
        ctx.rect(x - death, y - death, 10, 10);
        ctx.fill();
        }

    drawBullet = (ctx, x, y) => {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
    }

    async addScore(data) {
        const response = await fetch('/api/Scores', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    render() {
        if (sessionStorage.getItem("loggedIn") != 'true') {

            return (
                <Fragment>
                    <Link to="" component={Home} />
                    <Redirect to="./" />
                </Fragment>
            )
        }
        else {

            return (
                <Fragment>
                    <canvas className = "game" ref={this.canvasRef} tabIndex="1"></canvas>
                    <Chat nick={sessionStorage.getItem("username")} />
                </Fragment>
            )
        }
    }
}

export default Game;