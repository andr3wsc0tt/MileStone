import React, { Component } from 'react';

export class Home extends Component {

    static displayName = Home.name;

    constructor(props) {
        super(props);
        this.state = { users: [], loading: true };
    }

    componentDidMount() {
        this.populateUserData();
    }

    static renderUsersTable(users) {
        return (
            <table className='table table-striped' aria-labelledby="tabelLabel">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Username</th>
                        <th>Password</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user =>
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.password}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        );
    }

  render () {
      let contents = this.state.loading
          ? <p><em>Loading...</em></p>
          : Home.renderUsersTable(this.state.users);

      return (
          <div>
              <h1 id="tabelLabel" >User Table</h1>
              <p>This component demonstrates fetching data from the server.</p>
              {contents}
          </div>
      );
    }

    async populateUserData() {
        const response = await fetch('/api/Users');
        const data = await response.json();
        this.setState({ users: data, loading: false });
    }
}
