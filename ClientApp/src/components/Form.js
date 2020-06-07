import React, { Component, Fragment } from 'react'
import { Button, Form, Segment } from 'semantic-ui-react'
import { Route, Redirect, Link, BrowserRouter as Router } from 'react-router-dom';
import Game from './Game';

class FormExample extends Component {
    _isMounted = false;


    constructor(props) {
        super(props);

        this.state = {
            users: [],
            username: "",
            password: "",
            loggedIn: false
        };

    }

    checkUsername = () => {
            var name = this.state.users.map(user =>
                user.username
        ).indexOf(this.state.username);
        return name;
    }

    checkPassword = (name) => {
        var pass = this.state.users[name].password;
        if (pass === this.state.password)
            return true;
        else
            return false;
    }

    validate = () => {
        var name = this.checkUsername();
        if (name !== -1) {
            if (this.checkPassword(name)) {
                console.log("LOG IN");
                this.setState({ loggedIn: true });
                sessionStorage.setItem("loggedIn", "true");
                sessionStorage.setItem("username", this.state.username);
            }
            else
                console.log("WRONG PASS");
        }
        else {
            var data = {
                Username: this.state.username,
                Password: this.state.password
            };

            const matches = this.state.users.map(user => 
                user.username == this.state.username
            )

            console.log(matches)
            if (!matches.includes(true)) {
                this.addUser(data); 
            }
            else {
                console.log("That User Exists");
            }
        }
            
    }

    onChangeUser = (e) => {
        this.setState({ username : e.target.value })
    }

    onChangePass = (e) => {
        this.setState({ password: e.target.value })
    }

    componentDidMount() {
        this._isMounted = true;
        console.log("MOUNT");
        this.populateUserData();
    }

    componentWillUnmount() {
        this._isMounted = false;
        console.log("UNMOUNT");
    }

    render() {

        if (this.state.loggedIn == false && sessionStorage.getItem('loggedIn') != 'true') {

            console.log("WTF");
            return (
                <Segment inverted>
                    <Form inverted>
                        <Form.Group>
                            <Form.Input fluid label='Username' placeholder='Username' value={this.state.username} width={15} onChange={this.onChangeUser} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Input fluid label='Password' placeholder='Password' value={this.state.password} width={15} onChange={this.onChangePass} />
                        </Form.Group>
                        <Button type='submit' onClick={this.validate}>Submit</Button>
                    </Form>
                </Segment>
            )
        }
        else {
            console.log("HERE");
            return (
                <Fragment>
                    <Link to="" component={Game} />
                    <Redirect to="/game" />
                </Fragment>
            )
        }
    }

    async populateUserData() {

        const response = await fetch('/api/Users');
        const data = await response.json();

        if(this._isMounted)
            this.setState({ users: data });
    }

    async addUser(data) {

        const response = await fetch('/api/Users', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            sessionStorage.setItem("loggedIn", "true");
            sessionStorage.setItem("username", this.state.username);
            console.log("NEW USER");
            this.setState({ loggedIn: true });
        }
        else {
            data = await response.json();
            console.log(data.status, data.errors);
        }
    }
}
export default FormExample
