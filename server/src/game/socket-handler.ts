import {
  UserSessionModel
} from "../models/UserSession"

import {
  IUser
} from "../models/User"

import socketIO, { Namespace, Server as SocketIOServer } from "socket.io";

type Socket = socketIO.Socket;

type UserSocket = Socket & { user: IUser }

class SocketHandler {
  listeningForUpdates: {
    [id: string]: UserSocket
  } = {};

  clientListeners: Array<((client: UserSocket)=>any)> = [];

  io: Namespace;

  constructor(ioServer: SocketIOServer){
    this.io = ioServer.of("/gamelobby");
    this.io.on('connection', this.connectionListener);
  }

  connectionListener = (client: Socket)=>{
    console.log("client id:",client.id)

    const headers = client.handshake.headers;

    console.log("client headers:", headers)

    if(!("authorization" in headers)){
      console.log("No Authorization header")
      return client.disconnect()
    }

    var authHeader = (headers as {authorization: string}).authorization
    UserSessionModel.findUserByToken(authHeader).then((user: IUser)=>{

      console.log("found user:", user)

      if(!user){
        throw new Error("user not found")
      }

      var userClient: UserSocket = client as UserSocket;
      userClient.user = user;

      this.listeningForUpdates[user._id.toString()] = userClient

      this.clientListeners.forEach((l)=>{
        return l(userClient)
      })

      client.on('disconnect', () => {
        // delete listeningForUpdates
        delete this.listeningForUpdates[user._id.toString()];
      });
    }).catch((err)=>{
      var uS = client as UserSocket
      console.error("socket-findUserByToken:", err);
      if(uS.user){
        delete this.listeningForUpdates[uS.user._id.toString()];
      }
      uS.disconnect()
    })
  }

  getById(id: string): UserSocket{
    return this.listeningForUpdates[id];
  }

  getIO(){
    return this.io
  }


  listenForClient(listener: ((client: Socket)=>any)){
    this.clientListeners.push(listener);

    return ()=>{
      this.clientListeners = this.clientListeners.filter((l)=>{
        return l !== listener
      })
    }
  }

  broadcastSockets(key: string, value?: any){
    Object.values(this.listeningForUpdates).forEach((socket)=>{
      socket.emit(key, value);
    })
  }
}

export {
  SocketHandler
}
