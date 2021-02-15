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
  Rooms
} from "../rooms";

import {
  throwStatus
} from "../../utils/error"

import socketIO, { Socket, Server as SocketIOServer } from "socket.io";

import {
  SocketHandler
} from "../socket-handler";

import {
  setupController
} from "./controller"

import {
  createValidation
} from "./validator"

type GameSetupArgs = {
  server: HttpServer,
  ioServer: SocketIOServer
};

function setupGameLobbyRouter({ ioServer }: GameSetupArgs){

  const roomHandler = new Rooms();

  const GAME_LOBBY_ROOM = "/gamelobby"

  const upload = multer();
  var router = Router();

  var controller = setupController({ ioServer });

  var socketHandler = new SocketHandler(ioServer);

  router.get("/available", (req, res)=>{
    if(!req.user){
      return throwStatus(res, 401, "Not logged in")
    }
    var user = (req.user as IUser);
    GameLobbyModel.getAvailableGames().then((lobbies)=>{
      res.status(200).json(lobbies);
    }, (error)=>{
      console.error(error)
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
      console.error(error)
      return throwStatus(res, 400, error.message || error.toString())
    })
  })

  router.get("/joined", (req, res)=>{
    if(!req.user){
      return throwStatus(res, 401, "Not logged in")
    }
    var user = (req.user as IUser);
    GameLobbyModel.getJoinedGames(user._id).then((lobbies)=>{
      res.status(200).json(lobbies);
    }, (error)=>{
      console.error(error)
      return throwStatus(res, 400, error.message || error.toString())
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
      console.error(error)

      res.status(400).json({
        error: true,
        message: error.message || error.toString()
      })
    })
  })

  router.post('/create', upload.none(), (req, res)=>{
    if(!req.user){
      return res.status(401).json({
        error: true,
        message: "Not logged in"
      })
    }
    return controller.create(req.user as IUser, req.body).then((resultDoc)=>{
      res.status(200).json(resultDoc);
    }, (error)=>{
      console.error(error)

      if(error.message === "User not Logged In"){
        return res.status(401).json({
          error: true,
          message: error.message
        })
      }
      return res.status(400).json({
        error: true,
        message: error.message
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
    return controller.join(req.user as IUser, req.params.id).then((resultDoc)=>{
      res.status(200).json(resultDoc);
    }).catch((error)=>{
      console.error(error)
      if(error.message === "Missing Lobby"){
        return res.status(404).json({
          error: true,
          message: error.message || error.toString()
        })
      }
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
    return controller.leave(req.user as IUser, req.params.id).then((resultDoc)=>{
      res.status(200).json(resultDoc);
    }).catch((error)=>{
      console.error(error)

      if(error.message === "Missing Lobby"){
        return res.status(404).json({
          error: true,
          message: error.message || error.toString()
        })
      }
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
    return controller.cancel(req.user as IUser, req.params.id).then((resultDoc)=>{
      res.status(200).json(resultDoc);

    }).catch((error)=>{
      console.error(error)

      if(error.message === "Missing Lobby"){
        return res.status(404).json({
          error: true,
          message: error.message || error.toString()
        })
      }
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
    controller.start(req.user as IUser, req.params.id)
    .then((gameLobby)=>{
      res.status(200).json(gameLobby);
    }).catch((error)=>{
      console.error(error)

      if(error.message === "Missing Lobby"){
        return res.status(404).json({
          error: true,
          message: error.message || error.toString()
        })
      }
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
  setupGameLobbyRouter
}
