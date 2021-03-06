﻿import React, { Component } from 'react';

export class HighScores extends Component {

    // This is pretty much an unedited FetchData component from the React Template.

    static displayName = HighScores.name;

    constructor(props) {
        super(props);
        this.state = { users: [], loading: true };
    }

    componentDidMount() {
        this.populateUserData();
    }

    componentWillUnmount() {
    }

    static renderUsersTable(users) {
        return (
            <table className='table table-striped' aria-labelledby="tabelLabel">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>High Score</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user =>
                        <tr key={user.id}>
                            <td>{user.username}</td>
                            <td>{user.highscore}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        );
    }

    render() {
        let contents = this.state.loading
            ? <p><em>Loading...</em></p>
            : HighScores.renderUsersTable(this.state.users);

        return (
            <div>
                <h1 id="tabelLabel" >User Table</h1>
                <p>This component demonstrates fetching data from the server.</p>
                {contents}
            </div>
        );
    }

    // Get all scores from HighScore Db - sort them from greatest to smallest - Then set the top 10 to be rendered.
    async populateUserData() {
        const response = await fetch('/api/Scores');

        const data = await response.json();

        data.sort((a, b) => {
            return (a.highscore < b.highscore) - (a.highscore > b.highscore);
        })

        var top10 = data.slice(0, 10);

        this.setState({ users: top10, loading: false });
    }
}
