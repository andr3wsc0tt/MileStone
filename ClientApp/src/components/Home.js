import React, { Component } from 'react';
import ModalExample from './Modal';

export class Home extends Component {

    static displayName = Home.name;

    constructor(props) {
        super(props);
        this.state = { users: [], loading: true };
    }

    componentDidMount() {
        this.populateUserData();
    }

    render() {
        return (
            <ModalExample />
            )
    }

    async populateUserData() {
        const response = await fetch('/api/Users');
        const data = await response.json();
        this.setState({ users: data, loading: false });
    }
}
