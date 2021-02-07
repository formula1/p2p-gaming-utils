
import {
  fetchServer
} from "../API/api";

import {
  TypeOfGame,
  GameLobbyType
} from "./types";

function getAvailableGameLobbies(): Promise<Array<GameLobbyType>>{
  return fetchServer("/gamelobby/available")
}

function getOwnGameLobbies(): Promise<Array<GameLobbyType>>{
  return fetchServer("/gamelobby/own")
}

function getGameLobby(id: string): Promise<Array<GameLobbyType>>{
  return fetchServer("/gamelobby/" + id)
}

function joinGameLobby(id: string): Promise<Array<GameLobbyType>>{
  return fetchServer("/gamelobby/" + id + "/join")
}

function leaveGameLobby(id: string): Promise<Array<GameLobbyType>>{
  return fetchServer("/gamelobby/" + id + "/leave")
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
  return fetchServer("/gamelobby/create", {
    method: "POST",
    body: {
      name,
      minUsers,
      maxUsers,
      typeOfGame,
    }
  })

}

function cancelGameLobby(id: string): Promise<Array<GameLobbyType>>{
  return fetchServer("/gamelobby/" + id + "/cancel")
}

function startGameLobby(id: string): Promise<Array<GameLobbyType>>{
  return fetchServer("/gamelobby/" + id + "/start")
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
