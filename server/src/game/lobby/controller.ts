import { Router } from "express";
import { Server as HttpServer } from "http";
import * as bodyParser from 'body-parser';
import multer from "multer";

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
  throwStatus
} from "../../utils/error"

import socketIO, { Socket, Server as SocketIOServer } from "socket.io";

import {
  SocketHandler
} from "../socket-handler";

import {
  createValidation
} from "./validator"

type GameSetupArgs = {
  server: HttpServer,
  ioServer: SocketIOServer
};

function setupGameLobby({ ioServer }: GameSetupArgs){

  const GAME_LOBBY_ROOM = "/gamelobby"

  const upload = multer();
  var router = Router();

  var socketHandler = new SocketHandler(ioServer);

  router.get("/available", (req, res)=>{
    if(!req.user){
      return throwStatus(res, 401, "Not logged in")
    }
    var user = (req.user as IUser);
    GameLobbyModel.getAvailableGames().then((lobbies)=>{
      socketHandler.getById(user._id).join(GAME_LOBBY_ROOM);
      res.status(200).json(lobbies);
    }, (error)=>{
      return throwStatus(res, 400, error.message || error.toString())
    })
  })

  router.get("/own", (req, res)=>{
    if(!req.user){
      return throwStatus(res, 401, "Not logged in")
    }
    var user = (req.user as IUser);
    GameLobbyModel.getHostedGames(user._id).then((lobbies)=>{
      res.status(200).json(lobbies);
    }, (error)=>{
      return throwStatus(res, 400, error.message || error.toString())
    })
  })

  router.post('/create', upload.none(), (req, res)=>{
    if(!req.user){
      return res.status(401).json({
        error: true,
        message: "Not logged in"
      })
    }
    var user = (req.user as IUser);

    return Promise.resolve().then(()=>{
      return createValidation(req.body)
    }).then(
      (values: {
        name: string,
        minUsers: number,
        maxUsers: number,
        typeOfGame: TypeOfGame
      })=>{
        const doc = new GameLobbyModel({
          ...values,
          creator: user._id,
        });
        return doc.save().then((resultDoc)=>{
          res.status(200).json(resultDoc);
          const roomId = GAME_LOBBY_ROOM + "/"+resultDoc._id
          socketHandler.getById(user._id).join(roomId);
          socketHandler.getById(user._id).leave(GAME_LOBBY_ROOM);
          socketHandler.getIO()
            .to(GAME_LOBBY_ROOM)
            .to(roomId)
            .emit("update")
        })
      }
    ).catch((err)=>{
      return res.status(400).json({
        error: true,
        message: err.message
      })
    })
  })
  router.get("/:id", (req, res)=>{
    GameLobbyModel.findById(req.params.id)
    .then((resultDoc)=>{
      if(!resultDoc){
        return res.status(404).json({
          error: true,
          message: "Missing Lobby"
        })
      }
      Promise.all([
        UserModel.findById(resultDoc.creator),
        Promise.all(resultDoc.users.map((user)=>{
          return UserModel.findById(user);
        }))
      ]).then(([creator, users])=>{
        console.log("users: ", users)
        console.log("resultdoc:", resultDoc)
        res.status(200).json({
          lobby:resultDoc,
          userDocs: users,
          creatorDoc: creator
        });
      })
    }, (error)=>{
      res.status(400).json({
        error: true,
        message: error.message || error.toString()
      })
    })
  })

  router.get("/:id/join", (req, res)=>{
    if(!req.user){
      return res.status(400).json({
        error: true,
        message: "Not logged in"
      })
    }
    var user = (req.user as IUser);
    GameLobbyModel.findById(req.params.id).then((resultDoc)=>{
      if(!resultDoc){
        return res.status(404).json({
          error: true,
          message: "Missing Lobby"
        })
      }
      return resultDoc.joinLobby(user._id).then(()=>{
        res.status(200).json(resultDoc);
        const roomId = GAME_LOBBY_ROOM + "/"+req.params.id
        socketHandler.getById(user._id).leave(GAME_LOBBY_ROOM);
        socketHandler.getById(user._id).join(roomId);
        socketHandler.getIO()
          .to(GAME_LOBBY_ROOM)
          .to(roomId)
          .emit("update")
        return void 0;
      })
    }).catch((error)=>{
      res.status(400).json({
        error: true,
        message: error.message || error.toString()
      })
    })
  })


  router.get("/:id/leave", (req, res)=>{
    if(!req.user){
      return res.status(400).json({
        error: true,
        message: "Not logged in"
      })
    }
    var user = (req.user as IUser);
    GameLobbyModel.findById(req.params.id)
    .then((resultDoc: IGameLobby)=>{
      if(!resultDoc){
        return res.status(404).json({
          error: true,
          message: "Missing Lobby"
        })
      }
      return resultDoc.leaveLobby(user._id.toString()).then(()=>{
        res.status(200).json(resultDoc);

        const roomId = GAME_LOBBY_ROOM + "/"+req.params.id

        socketHandler.getById(user._id).leave(roomId);
        socketHandler.getById(user._id).join(GAME_LOBBY_ROOM);
        socketHandler.getIO()
          .to(roomId)
          .to(GAME_LOBBY_ROOM)
          .emit("update")
        return void 0;
      })
    }).catch((error)=>{
      res.status(400).json({
        error: true,
        message: error.message || error.toString()
      })
    })
  })

  router.get("/:id/cancel", (req, res)=>{
    if(!req.user){
      return res.status(400).json({
        error: true,
        message: "Not logged in"
      })
    }
    var user = (req.user as IUser);
    GameLobbyModel.findById(req.params.id).then((resultDoc)=>{
      if(!resultDoc){
        return res.status(404).json({
          error: true,
          message: "Missing Lobby"
        })
      }
      if(resultDoc.creator.toString() !== user._id.toString()){
        throw new Error("the user is not the creator");
      }
      return resultDoc.cancelLobby().then(()=>{
        const lobbyId = GAME_LOBBY_ROOM + "/" + req.params.id;
        var io = socketHandler.getIO();
        io.in(lobbyId).allSockets().then((socketIds: Set<string>)=>{
          Array.from(socketIds).forEach((id)=>{
            const socket = io.sockets.get(id);
            socket.leave(lobbyId)
            socket.join(GAME_LOBBY_ROOM)
          })
          socketHandler.getIO()
            .to(GAME_LOBBY_ROOM)
            .emit("update")
        })
        res.status(200).json(resultDoc);
      })
    }).catch((error)=>{
      res.status(400).json({
        error: true,
        message: error.message || error.toString()
      })
    })
  })

  router.get("/:id/start", (req, res)=>{
    if(!req.user){
      return res.status(400).json({
        error: true,
        message: "Not logged in"
      })
    }
    var user = (req.user as IUser);
    GameLobbyModel.findById(req.params.id).then((resultDoc)=>{
      if(!resultDoc){
        return res.status(404).json({
          error: true,
          message: "Missing Lobby"
        })
      }
      if(resultDoc.creator.toString() !== user._id.toString()){
        throw new Error(
          `the user ${user._id} is not the creator ${resultDoc.creator}`
        );
      }
      return resultDoc.startLobby().then(()=>{
        const lobbyId = GAME_LOBBY_ROOM + "/" + req.params.id;
        var io = socketHandler.getIO();
        io.in(lobbyId).allSockets().then((socketIds: Set<string>)=>{
          Array.from(socketIds).forEach((id)=>{
            const socket = io.sockets.get(id);
            socket.leave(lobbyId)
          })
          socketHandler.getIO()
            .to(GAME_LOBBY_ROOM)
            .emit("update")
        });
        res.status(200).json(resultDoc);
      })
    }).catch((error)=>{
      res.status(400).json({
        error: true,
        message: error.message || error.toString()
      })
    })
  })

  router.use((req, res, next)=>{
    res.status(404).send({
      error: true,
      message: "Non Existant Link"
    })
  })

  return { router };
}

export {
  setupGameLobby
}
