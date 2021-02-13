
import history from "../router/history";

import {
  authHandler
} from "../User/api";

import {
  TypeOfGame,
  GameLobbyType
} from "./types";

function getAvailableGameLobbies(): Promise<Array<GameLobbyType>>{
  return authHandler.authorizedFetch("/gamelobby/available")
}

function getOwnGameLobbies(): Promise<Array<GameLobbyType>>{
  return authHandler.authorizedFetch("/gamelobby/own")
}

function getGameLobby(id: string): Promise<GameLobbyType>{
  return authHandler.authorizedFetch("/gamelobby/" + id)
}

function joinGameLobby(id: string): Promise<GameLobbyType>{
  return authHandler.authorizedFetch("/gamelobby/" + id + "/join").then((lobby)=>{
    history.push("/lobby/" + id)
    return lobby
  })
}

function leaveGameLobby(id: string): Promise<GameLobbyType>{
  return authHandler.authorizedFetch("/gamelobby/" + id + "/leave").then((lobby)=>{
    history.push("/lobby/")
    return lobby
  }).catch((err)=>{
    if(err.message === "Missing Lobby"){
      history.push("/lobby/")
    }
    if(err.message === "Not Joined"){
      history.push("/lobby/")
    }
  })
}

type CreateGameLobbyArg = {
  name: string,
  minUsers: number,
  maxUsers: number,
  typeOfGame: TypeOfGame,
}

function createGameLobby({
  name,
  minUsers,
  maxUsers,
  typeOfGame,
}: CreateGameLobbyArg){
  console.log("creating lobby");

  var data = new FormData()
  data.append("name", name)
  data.append("minUsers", minUsers.toString())
  data.append("maxUsers", maxUsers.toString())
  data.append("typeOfGame", typeOfGame)

  return authHandler.authorizedFetch("/gamelobby/create", {
    method: "POST",
    body: data
  })

}

function cancelGameLobby(id: string): Promise<GameLobbyType>{
  return authHandler.authorizedFetch("/gamelobby/" + id + "/cancel").then((lobby)=>{
    history.push("/lobby/")
    return lobby
  })
}

function startGameLobby(id: string): Promise<Array<GameLobbyType>>{
  return authHandler.authorizedFetch("/gamelobby/" + id + "/start")
}

export {
  getAvailableGameLobbies,
  getOwnGameLobbies,

  getGameLobby,
  joinGameLobby,
  leaveGameLobby,

  createGameLobby,
  cancelGameLobby,
  startGameLobby
}
