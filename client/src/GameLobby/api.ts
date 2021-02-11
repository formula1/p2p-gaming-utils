
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

function getGameLobby(id: string): Promise<Array<GameLobbyType>>{
  return authHandler.authorizedFetch("/gamelobby/" + id)
}

function joinGameLobby(id: string): Promise<Array<GameLobbyType>>{
  return authHandler.authorizedFetch("/gamelobby/" + id + "/join")
}

function leaveGameLobby(id: string): Promise<Array<GameLobbyType>>{
  return authHandler.authorizedFetch("/gamelobby/" + id + "/leave")
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

function cancelGameLobby(id: string): Promise<Array<GameLobbyType>>{
  return authHandler.authorizedFetch("/gamelobby/" + id + "/cancel")
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
