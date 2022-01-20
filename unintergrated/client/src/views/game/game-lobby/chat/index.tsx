import React, { useState, useEffect } from "react";
import { WriteMessage } from "./write-message";
import { MessageList } from "./message-list";

type ChatProps = {
  websocket: WebSocket;
}

export function Chat(props: ChatProps){
  const { websocket } = props

  return (
    <div>
      <h2>Chat</h2>
      <MessageList websocket={websocket} />
      <WriteMessage websocket={websocket} />
    </div>
  )
}
