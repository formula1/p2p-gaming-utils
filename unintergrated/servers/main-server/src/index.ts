
import express, { Request, Response, NextFunction} from "express";
import { parse } from 'url';
import cors from "cors";

import { match as matchPath } from "path-to-regexp";

import {waitForMongoose} from "./utils/mongoose";

import { passportSession } from "./components/user/jwt/middleware";

import { createRouter as authRouter } from "./components/user/jwt/router";
import { createRouter as adminRouter } from "./components/admin";
import { createRouter as gameRouter } from "./game/components";

import { createWebsocketHandler as createGameLobbyWebsocketHandler } from "./game/websocket/game-lobby";
import { createWebsocketHandler as createGameWebsocketHandler } from "./game/websocket/game";


import { createServer } from "http"

import {
  PUBLIC_SERVER_URL
} from "./constants/public";

const server = createServer();

waitForMongoose().then(async ()=>{
  var app = express();
  server.on("request", app);

  app.use((req, res, next)=>{
    console.log("originalUrl", req.originalUrl)
    next()
  })
  // app.use((req, res, next)=>{
  //     res.header('Access-Control-Allow-Origin', 'localhost'); //replace localhost with actual host
  //     res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, PATCH, POST, DELETE');
  //     res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Authorization');
  //     next();
  // })
  app.use(cors());
  app.get("/", (req, res)=>{
    res.status(200).json({
      message: "Hello World"
    })
  })
  app.use(passportSession());
  app.use("/admin", await adminRouter());
  app.use("/auth", await authRouter())
  app.use("/game", await gameRouter());

  app.get("/user", (req, res, next)=>{
    if(req.user) res.status(200).json(req.user)
    else next({ status: 403, message: "no user"})
  })

  app.use(function(req, res, next) {
    next({
      status: 404,
      message: "Unknown"
    });
  });

  app.use(function(err: any, req: Request, res: Response, next: NextFunction) {
    res.status(err.status || 500);
    res.json({
      error: true,
      message: err.message || err.toString()
    })
  });


  // https://www.npmjs.com/package/path-to-regexp

  const gameLobbyWebsocketServer = await createGameLobbyWebsocketHandler();
  const gameLobbyMatch = matchPath("/game-lobby");


  const gameWebsocketServer = await createGameWebsocketHandler();
  const gameMatch = matchPath("/game/:id");


  server.on('upgrade', function upgrade(request, socket, head) {
    const parsedUrl = parse(request.url);
    var matchedParams;
    try {
      if (matchedParams = gameLobbyMatch(parsedUrl.path)) {
        (request as any).params = matchedParams.params;
        gameLobbyWebsocketServer.handleUpgrade(request, socket as any, head, function done(ws: any) {
          gameLobbyWebsocketServer.emit('connection', ws, request);
        });
      } else if(matchedParams = gameMatch(parsedUrl.path)){
        (request as any).params = matchedParams.params;
        gameWebsocketServer.handleUpgrade(request, socket as any, head, function done(ws: any) {
          gameWebsocketServer.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    }catch(e){
      console.error("socket connection error:", e);
      socket.destroy();
    }

  });


  server.listen(8080, ()=>{
    console.log("Accessible from:", PUBLIC_SERVER_URL)
  });


}).catch((err)=>{
    console.error(err);
    process.exit();
})
