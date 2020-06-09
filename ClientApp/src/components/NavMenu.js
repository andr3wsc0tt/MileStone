import React, { Component } from 'react';
import { Collapse, Container, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';
import './NavMenu.css';

// This is the default NavBar of the React Template. With the 'U' and 'D' of CRUD 

export class NavMenu extends Component {
    static displayName = NavMenu.name;

    constructor(props) {
        super(props);

        this.toggleNavbar = this.toggleNavbar.bind(this);
        this.state = {
            collapsed: true,
            reload: false
        };
    }

    toggleNavbar() {
        this.setState({
            collapsed: !this.state.collapsed
        });
    }

    // Get username from sessionStorage and Delete Record
    async deleteUser() {
        var username = sessionStorage.getItem('username');

        const response = await fetch('/api/Users');
        const data = await response.json();

        // Check in the database for a match to our sessionStorage username variable
        for (var item in data) {
            if (data[item].username == username) { // if username matches a record

                // Add prompt to check for correct pass

                // Delete the corresponding record using the records 'id'
                const response = await fetch(`/api/Users/${data[item].id}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data),
                });

                // Remove sessionsStorage variables and reload the window to trigger re-evaluation of login credentials
                sessionStorage.setItem('username', '');
                sessionStorage.setItem('loggedIn', '');
                window.location.reload(false);
            }
        }
    }

    // Get username from sessionStorage and PUT new password.
    async changePass() {
        var username = sessionStorage.getItem('username');

        const response = await fetch('/api/Users');
        const data = await response.json();

        for (var item in data) {
            if (data[item].username == username) {

                var newpass = window.prompt("New Password"); // Prompt for new password.

                // Set up new data object for JSON body.
                var newdata = { "id": data[item].id, "username": data[item].username, "password": newpass };

                // PUT updated 'newdata' to corresponding record id.
                const response = await fetch(`/api/Users/${data[item].id}`, {
                    method: 'PUT',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newdata),
                });
            }
        }
    }

    render() {

    // Just a Nav menu with Links and 2 buttons linked to delete the User and change User Pass.

    return (
      <header>
        <Navbar className="navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow mb-3" light>
          <Container>
            <NavbarBrand tag={Link} to="/">MileStone_Game</NavbarBrand>
            <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
            <Collapse className="d-sm-inline-flex flex-sm-row-reverse" isOpen={!this.state.collapsed} navbar>
              <ul className="navbar-nav flex-grow">
                <NavItem>
                  <NavLink tag={Link} className="text-dark" to="/">Home</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} className="text-dark" to="/game">Game</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} className="text-dark" to="/highscores">High Scores</NavLink>
                </NavItem>
              </ul>
            </Collapse>
            </Container>
                <button onClick={this.deleteUser}>Delete User</button>
                <button onClick={this.changePass}>Change Password</button>
        </Navbar>
      </header>
    );
  }
}
