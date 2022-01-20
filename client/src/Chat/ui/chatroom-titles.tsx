import { useState } from "react"

import {
  CSSProperties
} from "react"


type ChatRoomTitlesProps = {
  room: string,
  rooms: Array<string>,
  chooseRoom: (room: string)=>any
  removeRoom: (room: string)=>any
  addRoom: (room: string)=>any
}

const RoomTitlesCSS = {
  display: "flex",
  flexDirection: "row",
  width: "100%",
  alignItems: "center"
}

const ChosenRoomCSS = {
  backgroundColor: "#BBB",
  color: "#000"
}

const UnchosenRoomCSS = {
  backgroundColor: "#FFF",
  color: "#000"
}

function ChatRoomTitles(props: ChatRoomTitlesProps){

  var [roomName, setRoomName] = useState("");

  return (
    <div>
      <div>
        <input
          type="text"
          value={roomName}
          onChange={(e)=>{
            setRoomName(e.target.value)
          }}
        />
        <button
          onClick={(e)=>{
            e.preventDefault()
            props.addRoom(roomName)
            setRoomName("")
          }}
        >Add room</button>
      </div>
      <ul style={RoomTitlesCSS as CSSProperties}>{
        Object.keys(this.props.rooms).map((roomName)=>{
          return (
            <li
              key={roomName}
              style={props.room === roomName ? ChosenRoomCSS : UnchosenRoomCSS}
            >
              <a
                href="#"
                onClick={(e)=>{
                  e.preventDefault()
                  this.props.chooseRoom(roomName)
                }}
              >{roomName}</a>
              <a
                href="#"
                onClick={(e)=>{
                  e.preventDefault()
                  this.props.removeRoom(roomName)
                }}
              >✖️</a>
            </li>
          );
        })
      }</ul>
    </div>
  )
}

export {
  ChatRoomTitles
}
