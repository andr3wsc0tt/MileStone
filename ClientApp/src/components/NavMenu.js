import React, { Component } from 'react';
import { Collapse, Container, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from 'reactstrap';
import { Link } from 'react-router-dom';
import './NavMenu.css';

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


    async deleteUser() {
        var username = sessionStorage.getItem('username');

        const response = await fetch('/api/Users');
        const data = await response.json();

        for (var item in data) {
            if (data[item].username == username) {

                // Add prompt to check for correct pass

                const response = await fetch(`/api/Users/${data[item].id}`, {
                    method: 'DELETE',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data),
                });
                sessionStorage.setItem('username', '');
                sessionStorage.setItem('loggedIn', '');
                window.location.reload(false);
                console.log(data[item].id);
            }
        }
    }

    async changePass() {
        var username = sessionStorage.getItem('username');

        const response = await fetch('/api/Users');
        const data = await response.json();

        for (var item in data) {
            if (data[item].username == username) {

                var newpass = window.prompt("New Password");

                var newdata = { "id": data[item].id, "username": data[item].username, "password": newpass };

                const response = await fetch(`/api/Users/${data[item].id}`, {
                    method: 'PUT',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newdata),
                });
                
                console.log(newdata);

            }
        }
    }

  render () {
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
