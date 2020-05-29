import React, { Component } from 'react'
import { Button, Form, Segment } from 'semantic-ui-react'

class FormExample extends Component {

    constructor(props) {
        super(props);

        this.state = {
            users: [],
            username: "",
            password: ""
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
            if (this.checkPassword(name))
                console.log("LOG IN");
            else
                console.log("WRONG PASS");
        }
        else {
            var data = {
                Username: this.state.username,
                Password: this.state.password
            };
            this.addUser(data);
            console.log("NEW USER");
        }
            
    }

    onChangeUser = (e) => {
        this.setState({ username : e.target.value })
    }

    onChangePass = (e) => {
        this.setState({ password: e.target.value })
    }

    componentDidMount() {
        this.populateUserData();
    }

    render() {
        return(
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

    async populateUserData() {
        const response = await fetch('/api/Users');
        const data = await response.json();
        this.setState({ users: data });
    }

    async addUser(data) {
        fetch('/api/Users', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }
}
export default FormExample
