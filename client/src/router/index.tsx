import React, { Component } from "react";

import history from "./history";

import {
  UserContext
} from "../User/context";

import {
  User as UserType
} from "../User/types";

import {
  fetchServer
} from "../API/api"


import {
  Router,
  Switch,
  Route
} from "react-router-dom";

import App from "./menu";

import {
  MultipleGamePadsTestUI
} from "../Test/Gamepad"

import {
  GameLobbyList,
  CreateLobbyFormHistoryComponent,
  GameLobby
} from "../GameLobby/ui"


class MainRouter extends Component {
  state: {
    user: void | UserType
  } = {user: void 0}

  componentWillMount(){
    fetchServer("/auth/self").then((user)=>{

      console.log(user)

      this.setState({
        user: user
      })
    }, (error)=>{
      console.error(error)
    })
  }

  render(){
    const user = this.state.user;

    if(!user){
      return null
    }

    return (
      <UserContext.Provider value={user}>
        <Router history={history}>
          <App user={user}>
            <Switch>
              <Route exact path="/">
                <MultipleGamePadsTestUI />
              </Route>
              <Route exact path="/gamepad">
                <MultipleGamePadsTestUI />
              </Route>
              <Route exact path="/lobby">
                <GameLobbyList />
              </Route>
              <Route exact path="/lobby/create">
                <CreateLobbyFormHistoryComponent />
              </Route>

              <Route path="/lobby/:id" component={GameLobby} />
            </Switch>
          </App>
        </Router>
      </UserContext.Provider>
    );
  }
}


export {
  MainRouter
}
