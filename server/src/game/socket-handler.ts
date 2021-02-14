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
  userSockets: {
    [id: string]: UserSocket
  } = {};

  clientJoinListeners: Array<((client: UserSocket)=>any)> = [];
  clientLeaveListeners: Array<((userID: string)=>any)> = [];

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

      this.userSockets[user._id.toString()] = userClient

      this.clientJoinListeners.forEach((l)=>{
        return l(userClient)
      })

      client.on('disconnect', () => {
        // delete listeningForUpdates
        delete this.userSockets[user._id.toString()];
        this.clientLeaveListeners.forEach((l)=>{
          return l(user._id.toString())
        })
      });
    }).catch((err)=>{
      var uS = client as UserSocket
      console.error("socket-findUserByToken:", err);
      if(uS.user){
        delete this.userSockets[uS.user._id.toString()];
      }
      uS.disconnect()
    })
  }

  getById(id: string): UserSocket{
    return this.userSockets[id];
  }

  getIO(){
    return this.io
  }


  listenForClientJoin(listener: ((client: Socket)=>any)){
    this.clientJoinListeners.push(listener);

    return ()=>{
      this.clientJoinListeners = this.clientJoinListeners.filter((l)=>{
        return l !== listener
      })
    }
  }

  listenForClientLeave(listener: ((client: Socket)=>any)){
    this.clientJoinListeners.push(listener);

    return ()=>{
      this.clientJoinListeners = this.clientJoinListeners.filter((l)=>{
        return l !== listener
      })
    }
  }

  broadcastUsers(userIds: Array<string>, key: string, ...vales: Array<any>){
    userIds.forEach((userId)=>{
      this.userSockets[userId].emit(key, ...vales);
    })
  }

  broadcastSockets(key: string, value?: any){
    Object.values(this.userSockets).forEach((socket)=>{
      socket.emit(key, value);
    })
  }
}

export {
  SocketHandler,
  UserSocket
}
