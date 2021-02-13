import React, { FunctionComponent, Component } from "react"

import { io, Socket } from "socket.io-client";

import {
  authHandler
} from "../User/api";

import {
  SocketContext
} from "./context"

import {
  Link
} from "react-router-dom";

import {
  User as UserType
} from "../User/types"

function Menu(){
  return (
    <ul>
      <li>
        <Link to="/">Home</Link>
      </li>
      <li>
        <Link to="/game-pad">Game Pad Test</Link>
      </li>
      <li>
        <Link to="/lobby">Game Lobbies</Link>
      </li>
      <li>
        <Link to="/lobby/create">Create Lobby</Link>
      </li>
      <li>
        <a href="/logout">Log Out</a>
      </li>
    </ul>
  );
}

class App extends Component<{user:UserType}> {
  state: {
    websocket: void | Socket
  } = {
    websocket: void 0
  }

  componentDidMount(){
    this.setState({
      websocket: io("http://localhost:8081/gamelobby", {
        extraHeaders: {
          "authorization": authHandler.getAuthToken() as string
        }
      })
    })
  }

  componentWillUnmount(){
    this.state.websocket && this.state.websocket.close();
  }

  render(){
    if(!this.state.websocket){
      return null;
    }
    return (
      <SocketContext.Provider value={{ websocket: this.state.websocket}}>
        <div>
          <h1>Hello {this.props.user.name}</h1>
          <Menu />
          <hr />
          {this.props.children}
          <hr />
          <div>
            This is the footer
          </div>
        </div>

      </SocketContext.Provider>
    )
  }
}

export default App;
