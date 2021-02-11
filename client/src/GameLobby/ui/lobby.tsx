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
  getAvailableGameLobbies,
  getOwnGameLobbies,

  getGameLobby,
  joinGameLobby,
  leaveGameLobby,

  createGameLobby,
  cancelGameLobby,
  startGameLobby
} from "../api";


function RenderGame(props: { game: GameLobbyType, self: User }){
  const {
    game, self
  } = props;

  if(game.creator !== self._id){
    return <button
      onClick={(e)=>{
        e.preventDefault();
        leaveGameLobby(game._id);
        history.push("/lobby")

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
  return (
    <ul>
    {
      props.users.map((user)=>{
        return (<li>{user.name}</li>);
      })
    }
    </ul>
  );
}

function GameLobby (props: { match: HistoryMatch, self: User }){
  console.log(props);

  const  id = props.match.params.id

  const [lobby, setLobby] = useState(void 0);

  useEffect(() => {
    getGameLobby(id).then((lobby)=>{
      console.log("lobby:", lobby)
      setLobby(lobby)
    }, (err)=>{
      if(err.message === "Missing Lobby"){
        history.replace("/lobby")
      }
    })
  }, [props.match.url]);

  if(!lobby) {
    return null;
  }

  return (
    <UserContext.Consumer>
      {({user})=>{
        return !user ? null : (
          <div>
            <RenderGame self={user} game={lobby} />
            <RenderUsers users={lobby.users} />
          </div>
        )
      }}
    </UserContext.Consumer>
  );
}

export {
  GameLobby
}
