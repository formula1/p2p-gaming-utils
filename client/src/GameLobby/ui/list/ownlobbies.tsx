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
  getOwnGameLobbies,
} from "../../api";

import {
  SocketContext
} from "../../../router/context"

class OwnGameLobbyListComponent extends Component<{socket: Socket}> {

  refreshFn = new RunIfNotRunning();
  listener = ()=>{
    return this.refreshLobbies()
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
      return getOwnGameLobbies().then((lobbies: Array<GameLobbyType>)=>{
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
      <RenderList
        lobbies={this.state.lobbies}
      />
    );
  }
}

function OwnGameLobbyList(){
  return (
    <SocketContext.Consumer>
      {({websocket}: { websocket: Socket })=>{
        return (
          <OwnGameLobbyListComponent socket={websocket} />
        )
      }}
    </SocketContext.Consumer>
  );
}

export {
  OwnGameLobbyList
}
