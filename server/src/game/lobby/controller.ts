import { Server as HttpServer } from "http";

import {
  UserModel, IUser
} from "../../models/User";

import {
  IGameLobby,
  GameLobbyModel,
  TypeOfGameValues,
  TypeOfGame
} from "../../models/GameLobby";

import {
  Rooms
} from "../rooms";

import { Socket, Server as SocketIOServer } from "socket.io";

import {
  SocketHandler,
  UserSocket
} from "../socket-handler";

import {
  createValidation
} from "./validator"

type GameSetupArgs = {
  ioServer: SocketIOServer
};

type CreateBody = {
  name: string,
  minUsers: number,
  maxUsers: number,
  typeOfGame: TypeOfGame
}

function setupController({ ioServer }: GameSetupArgs){

  const GAME_LOBBY_ROOM = "/gamelobby"

  const roomHandler = new Rooms();
  var socketHandler = new SocketHandler(ioServer);

  socketHandler.listenForClientJoin((user: UserSocket)=>{
    roomHandler.join(GAME_LOBBY_ROOM, user.user._id)
  })

  socketHandler.listenForClientLeave((user: UserSocket)=>{
    var userId = user.user._id.toString();
    var rooms = roomHandler.getRoomsOfUsers(userId)
    if(!rooms){
      return console.log(userId, "has no rooms");
    }
    Promise.all(rooms.map((room)=>{
      if(room === GAME_LOBBY_ROOM){
        return
      }
      var lobbyId = room.split("/")[2]
      return controller.cancel(userId, lobbyId).catch((err)=>{
        console.error(err);
        throw err
      });
    })).then((results)=>{
      console.log(`on socket ${user.user._id} disconnect: ${results}`);
    })
  })

  const controller = {

    create(user: IUser, body: CreateBody): Promise<IGameLobby>{
      return Promise.resolve().then(()=>{
        if(!user){
          throw new Error("User not Logged In")
        }
        return createValidation(body)
      }).then(
        (values: CreateBody)=>{
          const doc = new GameLobbyModel({
            ...values,
            creator: user._id,
          });
          return doc.save().then((resultDoc)=>{

            const roomId = GAME_LOBBY_ROOM + "/"+resultDoc._id
            roomHandler.join(roomId, user._id)
            roomHandler.leave(GAME_LOBBY_ROOM, user._id)

            socketHandler
              .broadcastUsers(roomHandler.getUsersInRoom(roomId), "update")
            socketHandler
              .broadcastUsers(roomHandler.getUsersInRoom(GAME_LOBBY_ROOM), "update")
              return resultDoc;
          })
        }
      )
    },

    join(user: IUser, gameId: string): Promise<IGameLobby>{
      return GameLobbyModel.findById(gameId).then((resultDoc)=>{
        if(!resultDoc){
          throw new Error("Missing Lobby")
        }
        return resultDoc.joinLobby(user._id).then((gameLobby)=>{
          const roomId = GAME_LOBBY_ROOM + "/"+gameId

          roomHandler.leave(GAME_LOBBY_ROOM, user._id)
          roomHandler.join(roomId, user._id)

          socketHandler
            .broadcastUsers(roomHandler.getUsersInRoom(roomId), "update")
          socketHandler
            .broadcastUsers(roomHandler.getUsersInRoom(GAME_LOBBY_ROOM), "update")

          return gameLobby
        })
      })
    },

    leave(user: IUser, gameId: string): Promise<IGameLobby> {
      return GameLobbyModel.findById(gameId)
      .then((resultDoc: IGameLobby)=>{
        if(!resultDoc){
          throw new Error("Missing Lobby")
        }
        return resultDoc.leaveLobby(user._id.toString()).then((gameLobby)=>{
          const roomId = GAME_LOBBY_ROOM + "/"+gameId

          roomHandler.join(GAME_LOBBY_ROOM, user._id)
          roomHandler.leave(roomId, user._id)

          socketHandler
            .broadcastUsers(roomHandler.getUsersInRoom(roomId), "update")
          socketHandler
            .broadcastUsers(roomHandler.getUsersInRoom(GAME_LOBBY_ROOM), "update")

            return gameLobby
        })
      })
    },

    cancel(user: IUser, gameId: string): Promise<IGameLobby>{
      return GameLobbyModel.findById(gameId).then((resultDoc)=>{
        console.log(resultDoc);
        if(!resultDoc){
          throw new Error("Missing Lobby")
        }
        if(resultDoc.creator.toString() !== user._id.toString()){
          throw new Error("User is not the Creator");
        }
        return resultDoc.cancelLobby().then((gamelobby)=>{
          const roomId = GAME_LOBBY_ROOM + "/"+gameId

          socketHandler
            .broadcastUsers(roomHandler.getUsersInRoom(roomId), "leave")
          socketHandler
            .broadcastUsers(roomHandler.getUsersInRoom(GAME_LOBBY_ROOM), "update")

          roomHandler.join(GAME_LOBBY_ROOM, user._id)
          roomHandler.leave(roomId, user._id)
          return gamelobby
        })
      })
    },

    start(user: IUser, gameId: string): Promise<IGameLobby>{
      return GameLobbyModel.findById(gameId).then((resultDoc)=>{
        if(!resultDoc){
          throw new Error("Missing Lobby")
        }
        if(resultDoc.creator.toString() !== user._id.toString()){
          throw new Error("User is not the Creator");
        }
        return resultDoc.startLobby().then((gamelobby)=>{
          const lobbyId = GAME_LOBBY_ROOM + "/" + gameId;

          socketHandler
            .broadcastUsers(roomHandler.getUsersInRoom(lobbyId), "start")
          socketHandler
            .broadcastUsers(roomHandler.getUsersInRoom(GAME_LOBBY_ROOM), "update")

          roomHandler.leave(GAME_LOBBY_ROOM, user._id)
          roomHandler.join(lobbyId, user._id)
          return gamelobby
        })
      })
    }
  }

  return controller;
}

export {
  setupController
}
