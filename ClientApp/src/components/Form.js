import React, { Component, Fragment } from 'react'
import { Button, Form, Segment } from 'semantic-ui-react'
import { Redirect, Link } from 'react-router-dom';
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
    }

    // Go through all the users 'fetched' from User API
    checkUsername = () => {
            var name = this.state.users.map(user =>
                user.username
        ).indexOf(this.state.username); // if user name is in Users DB then return that record's index (-1 if it doesn't exist)
        return name;
    }

    // Check if returned record's index has matching password.
    checkPassword = (name) => {
        var pass = this.state.users[name].password; 
        if (pass === this.state.password)
            return true;
        else
            return false;
    }

    validate = () => {
        var name = this.checkUsername();
        // If username exists - check Password. Set state loggedIn to true and session storage variables loggedIn and username.
        if (name !== -1) {
            if (this.checkPassword(name)) {
                this.setState({ loggedIn: true });
                sessionStorage.setItem("loggedIn", "true");
                sessionStorage.setItem("username", this.state.username);
            }
            else {
                this.setState({ WrongPass: 'Sorry, wrong password' }); // Set error message
            }
        }
        else {
            // If username doesn't exist - then create new user and new password.
            var data = {
                Username: this.state.username,
                Password: this.state.password
            };
            this.addUser(data); 
        }
            
    }

    onChangeUser = (e) => { // Login username and reset error message
        this.setState({ username: e.target.value })
        this.setState({ UserFieldBlank: null });
    }

    onChangePass = (e) => { // Login pass and reset error message
        this.setState({ password: e.target.value })
        this.setState({ PassFieldBlank: null, WrongPass: null });
    }

    componentDidMount() { // On mount retrieve usernames from DB
        this._isMounted = true; // Used to prevent asynchronous functions from updating unmounted components..(or something)
        this.populateUserData();
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    render() {
        // Render the login page if you haven't logged in here, or if you haven't had session variable set.
        if (this.state.users === null) {
            setTimeout(() => { }, 1000);
        }
        if (this.state.loggedIn === false && sessionStorage.getItem('loggedIn') !== 'true') {
            return (
                <Segment inverted>
                    <Form inverted>
                        <Form.Group>
                            <Form.Input fluid label='Username' placeholder='Username' error={this.state.UserFieldBlank} value={this.state.username} width={15} onChange={this.onChangeUser} />
                        </Form.Group>
                        <Form.Group>

                            {/* error is set such that it can trigger wrong password or blank invalid*/}

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

    // Get Users DB from API endpoint
    async populateUserData() {

        const response = await fetch('/api/Users');
        const data = await response.json();

        if(this._isMounted)
            this.setState({ users: data });
    }

    // Use POST API to push (data) which is newly created {username, password}
    async addUser(data) {

        const response = await fetch('/api/Users', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });

        // If POST is valid - set loggedIn and username session variables and setState loggedIn
        if (response.ok) {
            sessionStorage.setItem("loggedIn", "true");
            sessionStorage.setItem("username", this.state.username);
            this.setState({ loggedIn: true });
        }
        else {
            // If response was not good - check Username error header and Password error header and set one or both with error messages
            data = await response.json();
            if (data.errors.Username !== undefined)
                this.setState({ UserFieldBlank: data.errors.Username[0] });
            if (data.errors.Password !== undefined)
                this.setState({ PassFieldBlank: data.errors.Password[0] });
        }
    }
}
export default FormExample
