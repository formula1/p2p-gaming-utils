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

import {
  getAvailableGameLobbies,
  getOwnGameLobbies,

  getGameLobby,
  joinGameLobby,
  leaveGameLobby,

  createGameLobby,
  cancelGameLobby,
  startGameLobby
} from "../api";

class GameLobbyList extends Component {
  socket: Socket;

  refreshFn = new RunIfNotRunning();

  state: {
    gameLobbies: Array<GameLobbyType>,
    filter: string
  } = {
    gameLobbies: [],
    filter: ""
  }

  componentDidMount(){
    this.socket = io("http://localhost:8081/gamelobby");
    this.socket.on("update", ()=>{
      console.log("socket update");
      return this.refreshLobbies()
    })
    return this.refreshLobbies();
  }

  refreshLobbies(){
    this.refreshFn.run(()=>{
      return getAvailableGameLobbies().then((lobbies: Array<GameLobbyType>)=>{
        this.setState({
          gameLobbies: lobbies.sort((a, b)=>{
            return b.created.getTime() - a.created.getTime()
          })
        })
      })
    })
  }


  componentWillUnmount(){
    this.socket.close();
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
                  <td><Link to={"/lobby/" + lobby._id}>{lobby.name}</Link></td>
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

export {
  GameLobbyList
}
