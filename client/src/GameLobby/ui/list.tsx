import React, {
  Component,
  ChangeEvent
} from "react";

import { Link } from 'react-router-dom';

import { io, Socket } from "socket.io-client";

import {
  RunIfNotRunning
} from "../../utils/promise-utils"

import { GameLobbyType } from "../types";

import history from "../../router/history"

import {
  getAvailableGameLobbies,
  joinGameLobby,
} from "../api";

import {
  SocketContext
} from "../../router/context"

class GameLobbyListComponent extends Component<{socket: Socket}> {

  refreshFn = new RunIfNotRunning();
  listener = ()=>{
    console.log("update")
    this.refreshLobbies()
  }

  state: {
    gameLobbies: Array<GameLobbyType>,
    filter: string
  } = {
    gameLobbies: [],
    filter: ""
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
          gameLobbies: lobbies.sort((a, b)=>{
            return new Date(b.created).getTime() - new Date(a.created).getTime()
          })
        })
      })
    })
  }

  onFilterChange(e: ChangeEvent){
    var target = e.target as HTMLInputElement
    var newValue = target.value;
    this.setState({
      filter: newValue
    })
  }

  render(){
    return (
      <table>
        <thead>
          <tr>
            <th>Name <input
              type="text"
              value={this.state.filter}
              onChange={(e)=>this.onFilterChange(e)}
            /></th>
            <th>Users</th>
            <th>Max Users</th>
          </tr>
        </thead>
        <tbody>
          {
            this.state.gameLobbies.filter((lobby)=>{
              return lobby.name.search(this.state.filter) > -1
            }).map((lobby)=>{
              return (
                <tr key={lobby._id}>
                  <td><a href="#" onClick={(e)=>{
                    e.preventDefault();
                    joinGameLobby(lobby._id).then(()=>{
                      history.push("/lobby/"+lobby._id)
                    })
                  }}>{lobby.name}</a></td>
                  <td>{lobby.users.length}</td>
                  <td>{lobby.maxUsers}</td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    )
  }
}

function GameLobbyList(){
  return (
    <SocketContext.Consumer>
      {({websocket}: { websocket: Socket })=>{
        return (
          <GameLobbyListComponent socket={websocket} />
        )
      }}
    </SocketContext.Consumer>
  )
}

export {
  GameLobbyList
}
