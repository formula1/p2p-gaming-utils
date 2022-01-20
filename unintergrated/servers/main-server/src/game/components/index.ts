import { Router } from "express";
import { passport } from "../../utils/passport";
import { upload } from "../../utils/multer";
import { waitForGridFs } from "../../utils/gridfs"
import * as path from "path";

import { IUser } from "../../models/User";

import {
  GameLobbyModel,
  IGameLobby
} from "../models/GameLobby";

import {
  destroyRoom,
} from "../shared-memory/rooms";

import { handleRequest } from "./create-game/handle-request";

export async function createRouter(){
  const gridFs = await waitForGridFs()
  var router = Router();

  router.use((req, res, next)=>{
    console.log("game router:", req.originalUrl)
    next()
  })

  router.get(
    "/list",
    passport.authenticate('jwt', {session: false}),
    (req, res, next)=>{
      console.log("game list")
      GameLobbyModel.find({}).exec().then((gameLobbies)=>{
        console.log("game list:", gameLobbies)
        res.status(200).json(gameLobbies)
      }).catch(next)
    }
  )

  router.post(
    "/create",
    passport.authenticate('jwt', {session: false}),
    (req, res, next)=>{
      console.log("before upload");
      next();
    },
    // upload.none(),
    upload.single("gameFile"),
    (req, res, next)=>{
      console.log("after upload");
      next();
    },
    handleRequest
  )

  router.get(
    "/join/:id",
    passport.authenticate('jwt', {session: false}),
    async (req, res, next)=>{
      try {
        var game = await GameLobbyModel.findById(req.params.id);
        await game.joinLobby((req.user as IUser)._id);
        res.json({ success: true })
      } catch(e){
        next(e)
      }
    }
  )

  router.get(
    "/file/:id",
    passport.authenticate('jwt', {session: false}),
    async (req, res, next)=>{
      try {
        var game = await GameLobbyModel.findById(req.params.id);
        if(!game){
          throw {
            status: 404,
            message: "No Game found"
          }
        }
        const readStream = gridFs.createReadStream({
          _id: game.fileId,
          root: '/game/create'
        })
        res.status(200)
        res.type('.zip')
        readStream.pipe(res)
      }catch(e){
        next(e)
      }

    }
  )

  router.delete(
    "/:id",
    passport.authenticate('jwt', {session: false}),
    async (req, res, next)=>{
      try {
        console.log("delete:", req.params.id)
        var user = req.user as IUser;
        var game = await GameLobbyModel.findById(req.params.id);
        console.log("game found?", game)
        if(!game){
          throw {
            status: 404,
            message: "No Game found"
          }
        }
        console.log("host is user?", game.host, user._id, game.host.toString() === user._id.toString());
        if(game.host.toString() !== user._id.toString()){
          throw {
            status: 403,
            message: "this user is not the game host"
          }
        }
        console.log("host wa:", game)
        await destroyRoom(user, req.params.id)
        res.status(200).json(game);
      }catch(e){
        next(e)
      }
    }
  )

  router.get(
    "/:id",
    (req, res, next)=>{
      console.log("get");
      next();
    },
    passport.authenticate('jwt', {session: false}),
    async (req, res, next)=>{
      try {
        console.log("get")
        var game = await GameLobbyModel.findById(req.params.id);
        console.log("game exists?", game);
        if(!game){
          throw {
            status: 404,
            message: "No Game found"
          }
        }
        res.status(200).json(game);
      }catch(e){
        console.error("get error:",e)
        next(e)
      }
    }
  );

  return router;

}
