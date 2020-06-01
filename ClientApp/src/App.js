import React, { Component } from 'react';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './components/Home';
import { FetchData } from './components/FetchData';
import { Counter } from './components/Counter';
import Chat from './components/Chat';
import Game from './components/Game';
import { UserList } from './components/UserList';

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
        console.log(this.state.loggedIn);
    return (
        <Layout>
        <Route exact path='/' component={Home} />
        <Route path='/counter' component={Counter} />
        <Route path='/fetch-data' component={FetchData} />
        <Route path='/chat' component={Chat} />
        <Route path='/game' component={Game} />
        <Route path='/userlist' component={UserList} />
        </Layout>
    );
  }
}
