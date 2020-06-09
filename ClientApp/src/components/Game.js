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
            myScore: 0,
            canvasWidth: 0,
            canvasHeight: 0
        };

        this.interval = null; // loop to send this.movement to the Hub every 1000/60 ms.
        this.canvasRef = React.createRef(); // Special React canvas method.

        // Key presses
        this.movement = {
            up: false,
            down: false,
            left: false,
            right: false,
            space: false
        }    
    }

    // This lifecycle method requires diligent connection and login checking because it will unmount before a connection is made and throw errors.
    componentWillUnmount = () => {
        
        if (sessionStorage.getItem("loggedIn") != 'true') {
            // Don't unmount if you haven't logged in yet.
            return;
        }

        // If you're still connected to the Hub and you're about to Unmount
        if (this.state.hubConnection) {

            // Get username and highscore - add them to HighScore DB
            var data = { Username: sessionStorage.getItem("username"), Highscore: this.state.myScore }
            this.addScore(data);

            // Clear the movement interval - then close connection to the hub.
            clearInterval(this.interval);
            this.setState({ hubConnection: this.state.hubConnection.stop() });
        }
    }

    // Same stringent connection and login setting is required (mostly because I couldn't prevent double mount and unmount)
    componentDidMount = () => {
        if (sessionStorage.getItem("loggedIn") != 'true') {
            // Don't mount if you're not logged in
            return;
        }

        const hubConnection = new signalR.HubConnectionBuilder().withUrl("/gameServer").build(); // Connect to GameHub

        var alive = true; // Truly?

        // All recurring calls have to be placed inside the hubConnection setState
        // 'Movement' talks to the server and 'state' is the incoming state changes from the server
        this.setState({ hubConnection}, () => {
            this.state.hubConnection
                .start()
                .then(() => {
                     // Initialize the user with their Hub ConnectionId / canvas Height & Width
                    this.state.hubConnection.invoke('NewPlayer')
                        .then((initClass) => {
                            var json =  JSON.parse(initClass); // From serialized InitClass (GameHub.cs)
                            this.setState({ myString: json.connectionId, canvasHeight: json.canvasHeight, canvasWidth: json.canvasWidth });

                        }).catch(err => console.error(err))
                    this.interval = setInterval(() => { // Movement call loop
                        // To die, to sleep - no more.
                        if (alive == false) {
                            var data = { Username: sessionStorage.getItem("username"), Highscore: this.state.myScore } // Update Score
                            this.addScore(data); // Push score to HighScore DB
                            clearInterval(this.interval); // Clear interval so that it doesn't get called while we're dead
                        }
                        // This pasaes our key presses to the server (It errors sometimes, but the catch prevents a crash)
                        // I couldn't stop it from being invoked after unmounting occured.
                        // catch(err => console.error("MEEEEES", err) prints the error to console.
                        this.state.hubConnection.invoke('Movement', this.movement).catch(err => err);
                      
                    }, 1000 / 60); // FrameRate
                })
                .catch(err => console.log('Error establishing connection'));


            // Get the updated state from the server / BackgroundService (Game.cs)
            this.state.hubConnection.on('state', (players) => {

                // Set up canvas and context
                const canvas = this.canvasRef.current;
                canvas.width = this.state.canvasWidth;
                canvas.height = this.state.canvasHeight;
                const context = canvas.getContext("2d");

                // Deserialize each player from the server.
                var playersObj = JSON.parse(players);
                for (var id in playersObj) {
                    var player = playersObj[id]; // Current player being rendered
                    var color = "black"; // Other Players
                    if (id == this.state.myString) { // If the player I'm rendering is me. Color me Red. Update my Score.
                        color = "red";
                        this.setState({ myScore: player.score });
                    }
                    if (player.hp > 0) { // If the player is alive. Draw.
                        this.drawMe(context, player.ax, player.ay, player.bx, player.by, player.cx, player.cy, color);
                    }
                    else if (player.death < 250) { // After a player dies they have 250 cycles for their explosion
                        this.explodeMe(context, player.x, player.y, player.death, color); // Explode them
                        if (id == this.state.myString) { // If I died
                            alive = false; // Set alive to false to trigger the clearInterval
                        }
                    }

                    for (var bul in player.bullets) { // Render each bullet
                        this.drawBullet(context, player.bullets[bul].x, player.bullets[bul].y);
                    }
                }
            });


        });

        const canvas = this.canvasRef.current; // Get Canvas from React.createRef();

        // KeyDown
        canvas.addEventListener('keydown', (event) => {
            switch (event.keyCode) {
                case 65: // A
                    this.movement.left = true;
                    break;
                case 87: // W
                    this.movement.up = true;
                    break;
                case 68: // D
                    this.movement.right = true;
                    break;
                case 83: // S
                    this.movement.down = true;
                    break;
                case 32: // Space
                    this.movement.space = true;
                    break;
            }
        })

        // KeyUp - same layout
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

    // draw the 3 points (ax,ay), (bx,by), (cx,cy) of the ship
    drawMe = (ctx, ax, ay, bx, by, cx, cy, color = "black") => {

        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.lineTo(cx, cy);
        ctx.fill();
    }

    // 4 rectanges exploding out at corners 10px every cycle
    explodeMe = (ctx, x, y, death, color) =>{
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.rect(x - death, y + death, 10, 10);
        ctx.rect(x + death, y + death, 10, 10);
        ctx.rect(x + death, y - death, 10, 10);
        ctx.rect(x - death, y - death, 10, 10);
        ctx.fill();
        }
    // BOULLLETS!
    drawBullet = (ctx, x, y) => {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Push (data) {username, score] to High Scores
    addScore(data) {
        const response = fetch('/api/Scores', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    render() {
        // If you aren't logged in, get redirected {Home}
        if (sessionStorage.getItem("loggedIn") != 'true') {

            return (
                <Fragment>
                    <Link to="" component={Home} />
                    <Redirect to="./" />
                </Fragment>
            )
        }
        else {
            // Render game canvas, then the Chat component {pass username into chat as nickname}
            return (
                <Fragment>
                    <canvas id = "game" ref={this.canvasRef} tabIndex="1"></canvas>
                    <Chat nick={sessionStorage.getItem("username")} />
                </Fragment>
            )
        }
    }
}

export default Game;