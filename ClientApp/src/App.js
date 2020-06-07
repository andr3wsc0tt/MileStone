import React, { Component } from 'react';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import Chat from './components/Chat';
import Game from './components/Game';
import { HighScores } from './components/HighScores';

import './custom.css'

export default class App extends Component {
  static displayName = App.name;

    constructor(props) {
        super(props);
        this.state = ({ loggedIn: false });
    }


    componentDidMount() {
        this.setState({ loggedIn: sessionStorage.getItem("loggedIn") });
    }

    render() {
        return (
            <Layout>
            <Route exact path='/' component={Home} />
            <Route path='/game' component={Game} />
            <Route path='/highscores' component={HighScores} />
            </Layout>
        );
  }
}
