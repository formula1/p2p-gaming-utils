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

  router.get("/gamelobby/available", (req, res)=>{
    GameLobbyModel.getAvailableGames().then((lobbies)=>{
      res.status(200).json(lobbies);
    }, (error)=>{
      res.status(400).json({
        error: true,
        message: error.message || error.toString()
      })
    })
  })

  router.get("/gamelobby/own", (req, res)=>{
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

  router.post('/gamelobby/create', bodyParser.json(), (req, res)=>{
    if(!req.user){
      return res.status(400).json({
        error: true,
        message: "Not logged in"
      })
    }
    var user = (req.user as IUser);
    var body = req.body;

    var minUsers = body.minUsers ? parseInt(body.minUsers) : 2
    var maxUsers = body.maxUsers ? parseInt(body.maxUsers) : 2

    if(minUsers < 2){
      return res.status(400).json({
        error: true,
        message: "Min users must be at least 2"
      })
    }
    if(maxUsers < 2){
      return res.status(400).json({
        error: true,
        message: "Max users must be at least 2"
      })
    }

    if(minUsers > maxUsers){
      return res.status(400).json({
        error: true,
        message: "Min users is greater than maxUsers"
      })
    }
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
  router.get("/gamelobby/:id", (req, res)=>{
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

  router.get("/gamelobby/:id/join", (req, res)=>{
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

  router.get("/gamelobby/:id/cancel", (req, res)=>{
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

  router.get("/gamelobby/:id/start", (req, res)=>{
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

export {
  setupGame
}
