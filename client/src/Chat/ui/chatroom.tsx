import {
  ChatMessage
} from "../types"

import {
  User
} from "../../User/types"

type ChatRoomProps = {
  roomName: string,
  users: Array<User>,
  messages: Array<ChatMessage>
}

function ChatRoom(props:ChatRoomProps){
  return (
    <div>
      <h3>{props.roomName}</h3>
      <div
        style={{
          display: "flex",
          flexDirection: "row"
        }}
      >
        <ul>
          {props.users.map((user)=>{
            return (
              <li>{user.name}</li>
            )
          })}
        </ul>
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
    </div>
  )
}
