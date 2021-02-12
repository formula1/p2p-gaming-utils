import { Router } from "express";
import { Server as HttpServer } from "http";
import * as bodyParser from 'body-parser';
import multer from "multer";

import socketIO, { Server as SocketIOServer } from "socket.io";
type Socket = socketIO.Socket;

import {
  UserModel, IUser
} from "../models/User";
import {
  IGameLobby,
  GameLobbyModel,
  TypeOfGameValues,
  TypeOfGame
} from "../models/GameLobby";

type GameSetupArgs = {
  server: HttpServer,
  ioServer: SocketIOServer
};

function setupGame({ ioServer }: GameSetupArgs){

  const upload = multer();

  var listeningForUpdates: {
    [id: string]: Socket
  } = {};

  function broadcastSockets(key: string, value?: any){
    Object.values(listeningForUpdates).forEach((socket)=>{
      socket.emit(key, value);
    })
  }

  const io = ioServer.of("/gamelobby");

  io.on('connection', (client: Socket) => {
    console.log("socket io connection", Object.keys(client))

    listeningForUpdates[client.id] = client

    client.on('disconnect', () => {
      // delete listeningForUpdates
      delete listeningForUpdates[client.id];
    });
  });

  var router = Router();

  router.get("/available", (req, res)=>{
    GameLobbyModel.getAvailableGames().then((lobbies)=>{
      res.status(200).json(lobbies);
    }, (error)=>{
      res.status(400).json({
        error: true,
        message: error.message || error.toString()
      })
    })
  })

  router.get("/own", (req, res)=>{
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

  router.post('/create', upload.none(), (req, res)=>{
    console.log("POST", '/create')
    if(!req.user){
      console.log("No user");
      return res.status(401).json({
        error: true,
        message: "Not logged in"
      })
    }
    var user = (req.user as IUser);

    return Promise.resolve().then(()=>{
      console.log("req body:", req.body)

      var body = req.body;
      var name = body.name;
      var minUsers = body.minUsers ? parseInt(body.minUsers) : 2
      var maxUsers = body.maxUsers ? parseInt(body.maxUsers) : 2
      var typeOfGame = body.typeOfGame;
      if(name.length < 7){
        throw new Error("Name of lobby must be at least 7 characters");
      }
      if(name.length > 255){
        throw new Error("Name of lobby can be at max 255 characters");
      }

      if(minUsers < 2){
        throw new Error("Min users must be at least 2");
      }
      if(maxUsers < 2){
        throw new Error("Max users must be at least 2");
      }

      if(minUsers > maxUsers){
        throw new Error("Min users is greater than maxUsers");
      }

      if(!TypeOfGameValues.some((typeOfGameValue)=>{
        return typeOfGameValue === typeOfGame
      })){
        throw new Error(
          "Type of Game can only be one of the following: " + JSON.stringify(TypeOfGameValues)
        )
      }

      return {
        name: name,
        minUsers: minUsers,
        maxUsers: maxUsers,
        typeOfGame: typeOfGame
      }
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
          broadcastSockets("update")
          res.status(200).json(resultDoc);
        })
      }
    ).catch((err)=>{
      console.error(err);
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
      res.status(200).json(resultDoc);
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
        broadcastSockets("update")
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
        broadcastSockets("update")
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
        broadcastSockets("update")
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
      if(resultDoc.creator !== user._id){
        throw new Error("the user is not the creator");
      }
      return resultDoc.startLobby().then(()=>{
        broadcastSockets("update")
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
  setupGame
}
