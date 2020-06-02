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
            myString: '',
            myScore: 0
        };

        this.canvasRef = React.createRef();

        this.movement = {
            up: false,
            down: false,
            left: false,
            right: false,
            space: false
        }    
    }

    componentDidMount = () => {

        if (sessionStorage.getItem("loggedIn") != 'true') {
            return;
        }

        const hubConnection = new signalR.HubConnectionBuilder().withUrl("/gameServer").build();

        var alive = true;

        this.setState({ hubConnection}, () => {
            this.state.hubConnection
                .start()
                .then(() => {
                    console.log('Connection started!');
                    this.state.hubConnection.invoke('NewPlayer')
                        .then((connectionId) => {
                            this.state.myString = connectionId;
                        })
                    var interval = setInterval(() => {
                        if (alive == false) {
                            var data = { Username: sessionStorage.getItem("username"), Highscore: this.state.myScore }
                            this.addScore(data);
                            clearInterval(interval);
                        }
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
                    var color = "black";
                    if (id == this.state.myString) {
                        color = "red";
                        this.state.myScore = player.score;
                    }
                    if (player.hp > 0) 
                        this.drawMe(context, player.x, player.y, player.angle, color);
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

    rotate = (cx, cy, x, y, angle) => {
        var radians = (Math.PI / 180) * angle,
            cos = Math.cos(radians),
            sin = Math.sin(radians),
            nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
            ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
        return [nx, ny];
    }

    drawMe = (ctx, x, y, angle, color = "black") => {

        var ax = x + 10;
        var ay = y;

        var bx = x - 15;
        var by = y - 12.5;

        var cx = x - 15;
        var cy = y + 12.5;

        var axD, ayD, bxD, byD, cxD, cyD;

        [axD, ayD] = this.rotate(x, y, ax, ay, angle);
        [bxD, byD] = this.rotate(x, y, bx, by, angle);
        [cxD, cyD] = this.rotate(x, y, cx, cy, angle);

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.moveTo(axD, ayD);
        ctx.lineTo(bxD, byD);
        ctx.lineTo(cxD, cyD);
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
                    <canvas ref={this.canvasRef} tabIndex="1"></canvas>
                    <Chat nick={sessionStorage.getItem("username")} />
                </Fragment>
            )
        }
    }
}

export default Game;