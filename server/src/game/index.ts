import { Router } from "express";
import { Server as HttpServer } from "http";
import * as bodyParser from 'body-parser';

import * as socketIO from "socket.io";

const SocketIOServer = socketIO.Server;
type Socket = socketIO.Socket;

import {
  UserModel, IUser
} from "../models/User";
import {
  IGameLobby,
  GameLobbyModel
} from "../models/GameLobby";

type GameSetupArgs = {
  server: HttpServer
};

function setupGame(args: GameSetupArgs){

  var listeningForUpdates: {
    [id: string]: Socket
  } = {};

  var server = args.server;
  var ioServer = new SocketIOServer(server);
  const io = ioServer.of("/gamelobby");

  io.on('connection', (client: Socket) => {
    console.log(client.request)

    client.on('disconnect', () => {
      // delete listeningForUpdates
    });
  });

  var router = Router();

  router.get("/lobby/available", (req, res)=>{
    GameLobbyModel.getAvailableGames().then((lobbies)=>{
      res.status(200).json(lobbies);
    }, (error)=>{
      res.status(400).json({
        error: true,
        message: error.message || error.toString()
      })
    })
  })

  router.get("/lobby/own", (req, res)=>{
    if(!req.user){
      return res.status(400).json({
        error: true,
        message: "Not logged in"
      })
    }
    var user = (req.user as IUser);
    GameLobbyModel.getHostedGames(user._id).then((lobbies)=>{
      res.status(200).json(lobbies);
    }, (error)=>{
      res.status(400).json({
        error: true,
        message: error.message || error.toString()
      })
    })
  })

  router.post('/lobby/create', bodyParser.json(), (req, res)=>{
    if(!req.user){
      return res.status(400).json({
        error: true,
        message: "Not logged in"
      })
    }
    var user = (req.user as IUser);
    var body = req.body;
    const doc = new GameLobbyModel({
      name: body.name,
      creator: user._id,
      minUsers: body.minUsers,
      maxUsers: body.maxUsers,
      typeOfGame: body.typeOfGame,
    });
    return doc.save().then((resultDoc)=>{
      Object.values(listeningForUpdates).forEach((socket)=>{
        socket.send("update")
      })
      res.status(200).json(resultDoc);
    }, (error)=>{
      res.status(400).json({
        error: true,
        message: error.message || error.toString()
      })
    })
  })

  router.get("/lobby/:id", (req, res)=>{
    GameLobbyModel.findById(req.params.id)
    .then((resultDoc)=>{
      if(!resultDoc){
        return res.status(404).json({
          error: true,
          message: "Missing Lobby"
        })
      }
      res.status(200).json(resultDoc);
    }, (error)=>{
      res.status(400).json({
        error: true,
        message: error.message || error.toString()
      })
    })
  })

  router.get("/lobby/:id/join", (req, res)=>{
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
        Object.values(listeningForUpdates).forEach((socket)=>{
          socket.send("update")
        })
      })
    }).catch((error)=>{
      res.status(400).json({
        error: true,
        message: error.message || error.toString()
      })
    })
  })

  router.get("/lobby/:id/cancel", (req, res)=>{
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
      if(resultDoc.creator !== user._id){
        throw new Error("the user is not the creator");
      }
      return resultDoc.cancelLobby().then(()=>{
        Object.values(listeningForUpdates).forEach((socket)=>{
          socket.send("update")
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

  router.get("/lobby/:id/cancel", (req, res)=>{
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
      if(resultDoc.creator !== user._id){
        throw new Error("the user is not the creator");
      }
      return resultDoc.startLobby().then(()=>{
        Object.values(listeningForUpdates).forEach((socket)=>{
          socket.send("update")
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

}
