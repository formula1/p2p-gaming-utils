import React, { Component } from "react";

import history from "./history";

import {
  UserContext
} from "../User/context";

import {
  User as UserType
} from "../User/types";

import {
  UserLogin,
  LoginList,
  RegisterLogin
} from "../User/ui";

import {
  fetchServer
} from "../API/api"

import {
  Router,
  Redirect,
  Switch,
  Route
} from "react-router-dom";

import App from "./menu";

import {
  MultipleGamePadsTestUI
} from "../Test/Gamepad"

import {

  AvailableGameLobbyList,
  JoinedGameLobbyList,
  OwnGameLobbyList,

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

    return (
      <UserLogin>
        <UserContext.Consumer>
        {
          (props: { user: any, strategies: any })=>{
            const {user} = props
            console.log(props)
            return !user ? (
              <div>
                <h1>Login</h1>
                <RegisterLogin />
              </div>
            ) : (
              <Router history={history}>
                <App user={user}>
                  <Switch>
                    <Route exact path="/">
                      <Redirect to="/lobby/available" />
                    </Route>
                    <Route exact path="/game-pad">
                      <MultipleGamePadsTestUI />
                    </Route>
                    <Route exact path="/lobby">
                      <Redirect to="/lobby/available" />
                    </Route>
                    <Route exact path="/lobby/available">
                      <AvailableGameLobbyList />
                    </Route>
                    <Route exact path="/lobby/own">
                      <OwnGameLobbyList />
                    </Route>
                    <Route exact path="/lobby/joined">
                      <JoinedGameLobbyList />
                    </Route>
                    <Route exact path="/lobby/create">
                      <CreateLobbyFormHistoryComponent />
                    </Route>

                    <Route path="/lobby/:id" component={GameLobby} />
                  </Switch>
                </App>
              </Router>
            )
          }
        }
        </UserContext.Consumer>
      </UserLogin>
    );
  }
}


export {
  MainRouter
}
