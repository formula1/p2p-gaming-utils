import React, { useEffect, useState } from "react";
import { useNavigate, Navigate, useParams } from "react-router-dom";

import {
  useAuth
} from "../../../context/user";

import {
  User
} from "../../../types/User"
import {
  GameLobby
} from "../../../types/GameLobby"


type UserProps = {
  self: User;
  host: string;
  user: string;
}

function User(props: UserProps){
  const auth = useAuth();
  let params = useParams();
  const [userObj, setUserObj] = useState(void 0)

  useEffect(()=>{
    auth.fetch("/auth/users/"+props.user).then((response)=>{
      return response.json().then((json)=>{
        if(response.ok){
          setUserObj(json);
        } else {
          console.error(json);
        }
      })
    })
  }, [])

  const user = props.user;
  const self = props.self;
  const host = props.host;
  const isHost = self._id === host
  return (
    <div>
      <span>{!userObj ? user : userObj.name}</span>
      {
        isHost && (user != self._id) ? (
          [
            <button
              onClick={()=>{
                auth.fetch("/game/kick/" + params.gameLobbyId, {
                  method: "post",
                  body: JSON.stringify({
                    userId: user
                  })
                })
              }}
            >Kick</button>,
            <button
              onClick={()=>{
                auth.fetch("/game/ban/" + params.gameLobbyId, {
                  method: "post",
                  body: JSON.stringify({
                    userId: user
                  })
                })
              }}
            >Ban</button>
          ]
        ) : null
      }
    </div>
  )
}

type UserListProps = {
  game: GameLobby;
  websocket: WebSocket;
}

export function UserList(props: UserListProps){
  const websocket = props.websocket
  let params = useParams();
  const [joined, setJoined] = useState(props.game.joined);
  const auth = useAuth();
  const self = auth.user;
  if(!self){
    return (
      <Navigate
        to={{ pathname: "/login", }}
      />
    )
  }

  useEffect(()=>{
    var listener = function(e: MessageEvent<any>){
      var data = JSON.parse(e.data);
      if(data.path !== "user-list"){
        return;
      }
      console

    };

    websocket.addEventListener("message", listener)

    return ()=>{
      console.log("component did unmount")
      websocket.send(JSON.stringify({
        path: "user-list",
        action: "exit"
      }))
      websocket.removeEventListener("message", listener)
    }
  }, [])

  return (
    <div>
      <h2>User List</h2>
      <div>
        {
          joined.some((joinedUser: string)=>{
            return self._id.toString() === joinedUser
          }) ? (
            <button
              onClick={()=>{
                auth.fetch("/game/watch/" + params.gameLobbyId, {
                  method: "post",
                  body: JSON.stringify({
                    userId: self._id
                  })
                })
              }}
            >Just Watch</button>
          ) : (
            <button
              onClick={()=>{
                auth.fetch("/game/join/" + params.gameLobbyId, {
                  method: "post",
                  body: JSON.stringify({
                    userId: self._id
                  })
                })
              }}
            >Join</button>
          )
        }
      </div>
      <ul>
        {
          joined.map((user)=>{
            return (
              <li>
                <User
                  user={user}
                  self={self}
                  host={props.game.host}
                />
              </li>
            )
          })
        }
        </ul>
    </div>
  )
}
