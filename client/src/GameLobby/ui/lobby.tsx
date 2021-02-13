import React, {
  Component,
  ChangeEvent,
  useEffect,
  useState
} from "react";

import { io, Socket } from "socket.io-client";

import {
  RunIfNotRunning
} from "../../utils/promise-utils"

import { GameLobbyType } from "../types";
import {
  User
} from "../../User/types"

import history, {
  HistoryMatch
} from "../../router/history";

import {
  UserContext
} from "../../User/context";

import {
  SocketContext
} from "../../router/context"

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

function RenderGame({ game, creator }: { game: GameLobbyType, creator: User }){
  return (
    <ul>
      <li><span>Name: </span><span>{game.name}</span></li>
      <li><span>Creator: </span><span>{creator.name}</span></li>
      <li><span>Type Of Game: </span><span>{game.typeOfGame}</span></li>
      <li><span>Min Users: </span><span>{game.minUsers}</span></li>
      <li><span>Max Users: </span><span>{game.maxUsers}</span></li>
    </ul>
  )
}


function RenderGameOptions(props: { game: GameLobbyType, self: User }){
  const {
    game, self
  } = props;

  if(game.creator !== self._id){
    return <button
      onClick={(e)=>{
        e.preventDefault();
        leaveGameLobby(game._id);
      }}
    >Leave</button>
  }

  return (
    <div>
      <button
        onClick={(e)=>{
          e.preventDefault();
          cancelGameLobby(game._id)
           history.push("/lobby")
        }}
      >Cancel</button>
      <button
        onClick={(e)=>{
          e.preventDefault();
          startGameLobby(game._id)
        }}
      >Start</button>
    </div>
  )

}

function RenderUsers(props: { users: Array<User> }){

  console.log("RenderUsers:", props)
  return (
    <div>
      <h3>Joined Users</h3>
      <ul>
      {
        props.users.map((user)=>{
          return (<li key={user._id}>{user.name}</li>);
        })
      }
      </ul>
    </div>
  );
}

// function RenderUser(props: { user: string }){
//   useEffect(() => {
//     getGameLobby(id).then((lobby)=>{
//       console.log("lobby:", lobby)
//       setLobby(lobby)
//     }, (err)=>{
//       if(err.message === "Missing Lobby"){
//         history.replace("/lobby")
//       }
//     })
//   }, [props.user]);
// }

class GameLobbyUI extends Component<{ socket: Socket, match: HistoryMatch, self: User }> {
  state: {
    lobby : void | {
      lobby : any,
      creatorDoc: any,
      userDocs: any
    }
  } = { lobby: void 0 }

  socketListener = ()=>{
    return this.refreshGameLobby()
  }

  componentDidMount(){
    this.props.socket.on("update", this.socketListener)
  }

  componentWillUnmount(){
    this.props.socket.off("update", this.socketListener)
  }

  refreshGameLobby(){
    const id = this.props.match.params.id
    getGameLobby(id).then((lobby)=>{
      console.log("lobby:", lobby)
      this.setState({lobby})
    });
  }

  render(){
    const { lobby } = this.state

    if(!lobby) {
      return null;
    }

    return (
      <UserContext.Consumer>
        {({user})=>{
          return !user ? null : (
            <div>
              <RenderGameOptions self={user} game={lobby.lobby} />
              <RenderGame
                game={lobby.lobby}
                creator={lobby.creatorDoc}
              />
              <RenderUsers users={lobby.userDocs} />
            </div>
          )
        }}
      </UserContext.Consumer>
    );
  }
}

function GameLobby(props: {match: HistoryMatch, self: User }){
  return (
    <SocketContext.Consumer>
      {({websocket}: { websocket: Socket })=>{
        return (
          <GameLobbyUI
            socket={websocket}
            match={props.match}
            self={props.self}
          />
        )
      }}
    </SocketContext.Consumer>
  )
}


export {
  GameLobby
}
