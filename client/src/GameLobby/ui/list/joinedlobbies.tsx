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
  getJoinedGameLobbies,
} from "../../api";

import {
  SocketContext
} from "../../../router/context"

class JoinedGameLobbyListComponent extends Component<{socket: Socket}> {

  refreshFn = new RunIfNotRunning();
  listener = ()=>{
    this.refreshLobbies()
  }

  state: {
    lobbies: Array<GameLobbyType>,
  } = {
    lobbies: []
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
      return getJoinedGameLobbies().then((lobbies: Array<GameLobbyType>)=>{
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
      <RenderList lobbies={this.state.lobbies} />
    )
  }
}

function JoinedGameLobbyList(){
  return (
    <SocketContext.Consumer>
      {({websocket}: { websocket: Socket })=>{
        return (
          <JoinedGameLobbyListComponent socket={websocket} />
        )
      }}
    </SocketContext.Consumer>
  )
}

export {
  JoinedGameLobbyList
}
