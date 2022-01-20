import { Component } from "react";
import { io, Socket } from "socket.io-client";
import {
  ChatMessage
} from "../types"

import {
  ChatRoomTitles
} from "./chatroom-titles";


type ChatsProp = {
  socket: Socket
}

type ChatsState = {
  [chatroom: string]: Array<ChatMessage>
}

class Chats extends Component<ChatsProp> {
  state: {
    chats: ChatsState,
    room: string | void
  } = {
    chats: {},
    room: void 0
  }

  handleMessage = (chatroom: string, message: ChatMessage)=>{
    if(!this.state.room){
      this.setState({room:chatroom})
    }

    if(!this.state.chats[chatroom]){
      console.log("")
      return this.setState({
        chats: {
          ...this.state.chats,
          [chatroom]: [message]
        }
      })
    }
    return this.setState({
      chats: {
        ...this.state.chats,
        [chatroom]: this.state.chats[chatroom].concat([message]).sort((a, b)=>{
          return b.time - a.time
        })
      }
    })
  }

  removeChatRoom = (roomName: string)=>{
    var chatrooms = Object.keys(this.state.chats)
    var firstRoom = void 0;
    var chats = chatrooms.reduce((chats: ChatsState, room)=>{
      if(room !== roomName){
        if(firstRoom === void 0){
          firstRoom = room
        }
        chats[room] = this.state.chats[room]
      }
      return chats
    }, {})
    this.setState({chats: chats})
    if(roomName === this.state.room){
      this.setState({
        room: firstRoom
      })
    }

    this.props.socket.emit("remove-chatroom", roomName);
  }

  componentDidMount(){
    this.props.socket.on("chat-message", this.handleMessage)
  }

  componentWillUnmount(){
    this.props.socket.off("chat-message", this.handleMessage)
  }

  render(){
    return (
      <div>
        <div>
          <input  />
        </div>
        <ChatRoomTitles
          room={this.state.room || ""}
          rooms={Object.keys(this.state.chats)}
          chooseRoom={(roomName)=>{
            this.setState({room:roomName})
          }}
          removeRoom={(roomName)=>{
            this.removeChatRoom(roomName);
          }}
        />
        {!this.state.room ? null : (
          <div>
            <h3>{this.state.room}</h3>
            <ul>
              {
                this.state.chats[this.state.room].map((chatMessage)=>{
                  return (
                    <li>
                      <span>{chatMessage.user}</span>
                      <span>{chatMessage.time}</span>
                      <span>{chatMessage.message}</span>
                    </li>
                  )
                })
              }
            </ul>
          </div>
        )}
      </div>
    );
  }
}


export {
  Chats
}
