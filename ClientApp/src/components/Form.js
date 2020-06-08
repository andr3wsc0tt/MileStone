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
            loggedIn: false,
            WrongPass: null,
            UserFieldBlank: null,
            PassFieldBlank: null

        };


        
        //this.FieldBlank = 'This field cannot be left blank';

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
                this.setState({ loggedIn: true });
                sessionStorage.setItem("loggedIn", "true");
                sessionStorage.setItem("username", this.state.username);
            }
            else {
                this.setState({ WrongPass: 'Sorry, wrong password' });
            }
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
        }
            
    }

    onChangeUser = (e) => {
        this.setState({ username: e.target.value })
        this.setState({ UserFieldBlank: null });
    }

    onChangePass = (e) => {
        this.setState({ password: e.target.value })
        this.setState({ PassFieldBlank: null, WrongPass: null });
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
            return (
                <Segment inverted>
                    <Form inverted>
                        <Form.Group>
                            <Form.Input fluid label='Username' placeholder='Username' error={this.state.UserFieldBlank} value={this.state.username} width={15} onChange={this.onChangeUser} />
                        </Form.Group>
                        <Form.Group>
                            <Form.Input fluid label='Password' placeholder='Password' error={this.state.WrongPass || this.state.PassFieldBlank} value={this.state.password} width={15} onChange={this.onChangePass} />
                        </Form.Group>
                        <Button type='submit' onClick={this.validate}>Submit</Button>
                    </Form>
                </Segment>
            )
        }
        else {
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
            if (data.errors.Username != undefined)
                this.setState({ UserFieldBlank: data.errors.Username[0] });
            if (data.errors.Password != undefined)
                this.setState({ PassFieldBlank: data.errors.Password[0] });
        }
    }
}
export default FormExample
