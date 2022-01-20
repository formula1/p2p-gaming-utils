import { WebSocketServer, WebSocket } from 'ws';
import { parse as parseUrl } from 'url';
import * as querystring from "querystring";
import * as jwt from "jsonwebtoken";

import {
  IUser
} from "../../models/User";

import { JWT_SECRET } from "../../constants/session";

import {
  rooms,
  joinTheRoom,
  destroyRoom,
} from "../shared-memory/rooms";

export function createWebsocketHandler(){
  const wss = new WebSocketServer({ noServer: true });

  wss.on('connection', async function connection(ws, request) {
    try {
      const params = (request as any).params;
      const parsedUrl = parseUrl(request.url);

      var query = querystring.parse(parsedUrl.query);

      var lobbyId = query.lobbyId as string;
      var decodedJWT = jwt.verify(query.auth as string, JWT_SECRET);

      const user = (decodedJWT as any).user;
      await joinTheRoom(lobbyId, user, ws)
    }catch(e){
      console.error("error connecting:", e);
      ws.close();
    }
  });

  return wss
}
