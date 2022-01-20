import React, { useEffect, useState } from "react"
import { UserList } from "./user-list"
import { Chat } from "./chat"
import { GameInfo } from "./game-info";
import { useNavigate, Navigate, useParams } from "react-router-dom";

import {
  GameLobby
} from "../../../types/GameLobby"


import {
  useAuth
} from "../../../context/user";

type GameLobbyProps = {
}

export function GameLobby(props: GameLobbyProps){
  let params = useParams();
  const auth = useAuth();
  const navigate = useNavigate()
  const [game, setGame] = useState(null);
  const [ws, setWs] = useState(null);

  console.log("params:", params);
  console.log("auth:", auth);

  if(!auth.user){
    return (
      <Navigate
        to={{ pathname: "/login", }}
      />
    )
  }

  const userId = auth.user._id


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


  useEffect(
    ()=>{
      auth.fetch("/game/" + params.gameLobbyId).then((response)=>{
        return response.json().then((json)=>{
          if(!response.ok){
            if(response.status === 404){
              return navigate("/game-lobby")
            }
            throw json
          } else {
            console.log("game:", json);
            setGame(json)
          }
        })
      }).catch((err)=>{
        console.error("get gamelobby:", err);
      });
    }, []
  )

  if(ws === null){
    return null;
  }

  if(game === null){
    return null;
  }

  console.log("user, game", auth.user, game);


  return (
    <div>
      <div>
        {userId === game.host && (
          <button onClick={async (e)=>{
            e.preventDefault()
            const response = await auth.fetch("/game/" + params.gameLobbyId, {
              method: "DELETE"
            })
            const json = response.json();
            if(!response.ok){
              return console.error("delete did not work")
            }
            console.log("delete successful")
            navigate("/game-lobby")
          }}>Delete</button>
        )}
      </div>
      <h1>{game.lobbyName}</h1>
      <UserList game={game} websocket={ws} />
      <Chat websocket={ws} />
      <GameInfo game={game} websocket={ws} />
    </div>
  )
}
