import React, {
  Component,
  ChangeEvent
} from "react";

import { io, Socket } from "socket.io-client";

import {
  RunIfNotRunning
} from "../../../utils/promise-utils"

import { GameLobbyType } from "../../types";

import { RenderList } from "./renderlist";

import {
  getAvailableGameLobbies,
} from "../../api";

import {
  SocketContext
} from "../../../router/context"

class AvailableGameLobbyListComponent extends Component<{socket: Socket}> {

  refreshFn = new RunIfNotRunning();
  listener = ()=>{
    this.refreshLobbies()
  }

  state: {
    lobbies: Array<GameLobbyType>,
  } = {
    lobbies: [],
  }

  componentDidMount(){
    this.props.socket.on("update", this.listener)
    this.refreshLobbies();
  }

  componentWillUnmount(){
    this.props.socket.off("update", this.listener);
  }

  refreshLobbies(){
    console.log("run refresh lobbies");
    this.refreshFn.run(()=>{
      return getAvailableGameLobbies().then((lobbies: Array<GameLobbyType>)=>{
        console.log("found lobbies:", lobbies);
        this.setState({
          lobbies: lobbies.sort((a, b)=>{
            return new Date(b.created).getTime() - new Date(a.created).getTime()
          })
        })
      })
    })
  }

  render(){
    return (
      <div>
        <h1>Available Lobbies</h1>
        <RenderList lobbies={this.state.lobbies} />
      </div>
    )
  }
}

function AvailableGameLobbyList(){
  return (
    <SocketContext.Consumer>
      {({websocket}: { websocket: Socket })=>{
        return (
          <AvailableGameLobbyListComponent socket={websocket} />
        )
      }}
    </SocketContext.Consumer>
  )
}

export {
  AvailableGameLobbyList
}
