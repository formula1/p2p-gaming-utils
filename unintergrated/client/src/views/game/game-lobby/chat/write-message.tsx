import React, { useState, useEffect } from "react";

type ChatProps = {
  websocket: WebSocket;
}

export function WriteMessage(props: ChatProps){
  const [message, setMessage] = useState("");

  return (
    <form
      onSubmit={(e)=>{
        e.preventDefault()
        props.websocket.send(JSON.stringify({
          path: "chat",
          message: message
        }))
        setMessage("");
      }}
    >
      <input
        type="text"
        value={message}
        onChange={(e)=>{setMessage(e.target.value)}}
      />
      <button type="submit" >Send</button>
    </form>
  )
}
