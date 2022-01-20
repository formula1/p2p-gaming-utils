import React, { useEffect, useState } from "react"
import { useNavigate, Navigate, useParams } from "react-router-dom";

import {
  useAuth
} from "../../../../context/user";


import { GameIframe } from "./game-iframe"

export function GameRoute(){
  let params = useParams();
  const auth = useAuth();
  const navigate = useNavigate()
  const [ws, setWs] = useState(null);

  // gameId: string;
  // self: string;
  // users: Array<string>

  const user = auth.user;

  if(typeof user === "undefined"){
    return (
      <Navigate
        to={{ pathname: "/login", }}
      />
    )
  }

  useEffect(
    ()=>{
      var token = auth.getToken();
      var websocket = auth.createWebsocket(
        "/game-lobby",
        {
          auth: token,
          lobbyId: params.gameLobbyId
        }
      )
      websocket.addEventListener("message", (e)=>{
        var val = e.data;
        var json = JSON.parse(val);
        if(json.path !== "/delete-room") return;
        console.log("websocket deletes")
        navigate("/game-lobby")
      })
      websocket.addEventListener("open", ()=>{
        setWs(websocket)
      })
      // var websocket = new WebSocket();
      return ()=>{
        websocket.close()
      }
    }, []
  )


  if(ws === null){
    return null;
  }


  return (
    <GameIframe
      websocket={ws}
      gameId={params.gameId}
      self={user._id}
      users={[]}
    />
  )


}
