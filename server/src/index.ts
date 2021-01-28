import * as fs from "fs";
import * as path from "path"
import mongoose from 'mongoose';

import ExpressApp, {
  Router,
  Response,
  Request
} from "express"

import cors from "cors";

import {
  setupPassport
} from "./passport-strategy";

var http, { Server } = require('http');
var https = require('https');

const {
  PUBLIC_SERVER_IS_SECURE,

  PUBLIC_SERVER_HTTPS_PRIVATE_KEY,
  PUBLIC_SERVER_HTTPS_CERTIFICATE,

  PUBLIC_SERVER_HOSTNAME,
  PUBLIC_SERVER_PORT,
  SESSION_SECRET,

  INTERNAL_START_PORT,
} = process.env

const httpServer = require(
  PUBLIC_SERVER_IS_SECURE==="true" ? "https" : "http"
);

const locationOrigin = `http${PUBLIC_SERVER_IS_SECURE==="true"?"s":""}://${PUBLIC_SERVER_HOSTNAME}${PUBLIC_SERVER_PORT==="80"?"":":"+PUBLIC_SERVER_PORT}`;


new Promise((res)=>{
  setTimeout(res, 1000 * 1)
}).then(()=>{
  const {
    MONGO_DB_HOSTNAME,
    MONGO_DB_PORT,
    MONGO_INITDB_ROOT_USERNAME,
    MONGO_INITDB_ROOT_PASSWORD,
    MONGO_INITDB_DATABASE,
  } = process.env

  const user = MONGO_INITDB_ROOT_USERNAME;
  const pass = MONGO_INITDB_ROOT_PASSWORD;
  const uri = MONGO_DB_HOSTNAME;
  const port = MONGO_DB_PORT;
  const db = MONGO_INITDB_DATABASE;

  // const mongoUrl = `mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@${MONGO_DB_HOSTNAME}/${MONGO_INITDB_DATABASE}?authSource=${MONGO_INITDB_DATABASE}&w=1`;
  // const mongoUrl = `mongodb://${MONGO_DB_HOSTNAME}/${MONGO_INITDB_DATABASE}`;

  const mongoUrl = `mongodb://${user}:${pass}@${uri}:${port}/${db}?authSource=admin`;

  console.log("mongoUrl:", mongoUrl)

  return mongoose.connect(
    mongoUrl,
    {
      useNewUrlParser: true,
      // useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    }
  )
}).then(()=>{
  console.log("connected to mongoose")
  const mainRouter = ExpressApp();

  mainRouter.use(cors());

  return new Promise((res)=>{

    const passportSetup = setupPassport({
      strategyFolder: path.join(__dirname, "/passport-strategy/hidden"),
      locationOrigin: locationOrigin,
      sessionSecret: SESSION_SECRET || "SESSION_SECRET",
      mongooseConnection: mongoose.connection
    })

    mainRouter.use(passportSetup.router);
    res("ok");
  }).then(()=>{

    mainRouter.get("/", (req, res)=>{
      console.log("get /");
      res.status(200).sendFile(`${__dirname}/public/index.html`);
    });

    mainRouter.use(ExpressApp.static(`${__dirname}/public`))

    mainRouter.use(function (req, res, next) {
      res.status(404).send("Sorry can't find that!")
    })

    mainRouter.use(function (err: any, req: Request, res: Response, next: (err: any)=>any) {
      console.error(err.stack)
      res.status(500).send('Something broke! <br/> ' + err.message)
    })

  }).then(()=>{

      var server: typeof Server;
      if(PUBLIC_SERVER_IS_SECURE==="true"){
        var privateKey  = fs.readFileSync('certificates/key.pem', 'utf8');
        var certificate = fs.readFileSync('certificates/cert.pem', 'utf8');
        var https = require("https");
        server = https.createServer({
          key: PUBLIC_SERVER_HTTPS_PRIVATE_KEY,
          cert: PUBLIC_SERVER_HTTPS_CERTIFICATE
        })
      }else{
        var https = require("http");
        server = https.createServer()
      };

      server.on("request", mainRouter);

      return new Promise((res, rej)=>{
        server.listen(INTERNAL_START_PORT, (err: any)=>{
          err ? rej(err) : res(void 0);
        })
      })
  })

}).then(()=>{
  console.log("ready, go to: ", locationOrigin)
}).catch((error)=>{
  console.error(error);
});
