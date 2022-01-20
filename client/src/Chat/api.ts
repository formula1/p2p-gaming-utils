
import { io, Socket } from "socket.io-client";

import {
  ChatMessage
} from "./types"

type RoomListener = (rooms: Array<string>)=>any
type MessageListener = (message: ChatMessage)=>any

class ChatAPI {
  chatRooms = {}
  messageListeners: {
    [roomName: string]: Array<MessageListener>
  } = {};
  roomListeners: Array<RoomListener>
  socket: Socket;

  handleMessage = (room: string, message: ChatMessage)=>{
    var listeners = this.messageListeners[room];
    listeners.forEach((l)=>{
      l(message)
    })
  }

  constructor(socket: Socket){
    this.socket = socket;
    this.socket.on("chat-message", this.handleMessage)
  }

  deconstructor(){
    this.socket.off("chat-message", this.handleMessage)
  }

  addChatRoom(roomName: string){

  }
  removeChatRoom(roomName: string){

  }
  writeMessage(roomName:string, message:string){
    if(!(roomName in this.chatRooms)){
      throw new Error(`user is not in room ${roomName}`)
    }
    this.socket.
  }

  getRooms(){
    return Object.keys(this.chatRooms);
  }

  getMessages(roomName: string){
    return this.chatRooms[roomName]
  }

  listenForRoomUpdate(listener: RoomListener){
    this.roomListeners.push(listener);
    return ()=>{
      this.roomListeners = this.roomListeners.filter((l)=>{
        return l !== listener
      })
    }
  }
  listenForMessage(roomName: string, listener: MessageListener){
    if(!(roomName in this.messageListeners)){
      this.messageListeners[roomName] = []
    }
    this.messageListeners[roomName].push(listener);
    return ()=>{
      this.messageListeners[roomName] = this.messageListeners[roomName].filter((l)=>{
        return l !== listener
      });
      if(this.messageListeners[roomName].length === 0){
        delete this.messageListeners[roomName];
      }
    }
  }
}
