import {
  Request,
  Response,
  NextFunction
} from "express"

var stream = require('stream');

import {
  waitForGridFs
} from "../../../utils/gridfs"

import {
  GameLobbyModel
} from "../../models/GameLobby";

import { validateGameFile } from "./validate-game-file";

export async function handleRequest(
  req: Request,
  res: Response,
  next: NextFunction
){
  const gridFs = await waitForGridFs()
  const file = req.file;
  if(!file){
    return next({
      status: 400,
      message: "No file found"
    })
  }
  const fileId = (file as any).id
  try {
    console.log("hanlding post");

    console.log("req file:", req.file);


    const fileExists = await new Promise((res, rej)=>{
      gridFs.exist({
        _id: fileId,
        root: '/game/create'
      }, function (err, found) {
       if (err) return rej(err);
       res(found)
     });
    })

    if(!fileExists){
      throw new Error("File does not exist")
    }

    console.log('File exists');

    const buffer: Buffer = await new Promise((res, rej)=>{

      const chunks: Array<Buffer> = []
      var converter = new stream.Writable();
      converter.on('finish', function() {
        console.log("writable stream finished")
      });
      converter._write = function (chunk: Buffer) {
        console.log("writing data:", chunk)
        chunks.push(chunk);
      };

      const rs = gridFs.createReadStream({
        _id: fileId,
        root: '/game/create'
      })

      rs.on('end', function() {
        console.log("read stream ended");
        var b = Buffer.concat(chunks);
        res(b);
      });

      rs.on('error', function (err) {
          console.log('An error occurred!', err);
          rej(err);
      });

      rs.pipe(converter);

    })

    console.log(buffer);

    const jsonGameFile = await validateGameFile(buffer.buffer);

    console.log(file);

    var gameLobby = new GameLobbyModel();
    /*

    lobbyName: { type: String, require: true },
    fileId: { type: String, require: true },
    host: { type : ObjectId, ref: "User", require: true },
    minPlayers: { type : Number, require: true },
    maxPlayers: { type : Number, require: true },

    */

    gameLobby.lobbyName = req.body.gameName
    gameLobby.fileId = fileId;
    gameLobby.host = (req.user as any)._id;
    gameLobby.maxPlayers = jsonGameFile.players.max;
    gameLobby.minPlayers = jsonGameFile.players.min;

    await gameLobby.save();


    console.log()

    res.status(200).json(gameLobby)
  }catch(err){
    try {
      await new Promise((res, rej)=>{
        gridFs.remove({
          _id: fileId,
          root: '/game/create'
        }, function (err) {
          if (err) return rej(err);
          res(void 0);
        });
      })
    }catch(err2){

    }
    next(err);
  }
}
