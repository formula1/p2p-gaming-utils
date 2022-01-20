import React, { Component, useState, useEffect } from "react";

type ChatProps = {
  websocket: WebSocket;
}

type ChatMessage = {
  id: string;
  path: string;
  userName: string;
  message: string;
}

type ChatState = {
  messages: Array<ChatMessage>
}
/*
export class MessageList extends Component<ChatProps, ChatState> {

  state: { messages: [] };

  constructor(a: any, b: any){
    super(a, b);
    console.log("message list constructor")
    this.messageListener = this.messageListener.bind(this);
  }

  messageListener(e: MessageEvent<any>){
    var data = JSON.parse(e.data);
    if(data.path !== "chat"){
      return;
    }

    this.setState({
      messages: [...this.state.messages, data as ChatMessage]
    })
  }

  componentWillMount(){
    this.props.websocket.addEventListener("message", this.messageListener)

  }

  componentWillUnmount(){
    this.props.websocket.removeEventListener("message", this.messageListener)
  }

  render(){
    console.log("message list render:", this.state.messages)
    return (
      <ul>{
        this.state.messages.map((message: ChatMessage)=>{
          return(
            <li key={message.id}>
              <span>{message.userName}: </span>
              <pre>{message.message}</pre>
            </li>
          )
        })
      }</ul>
    );
  }
}

*/
export function MessageList(props: ChatProps){
  const { websocket } = props
  const [messages, setMessages] = useState([])

  useEffect(()=>{
    var listener = function(e: MessageEvent<any>){
      var data = JSON.parse(e.data);
      if(data.path !== "chat"){
        return;
      }
      console.log("old:", messages)

      const newMessages = messages.concat([ data ]);

      console.log("new:", newMessages)

      setMessages((oldState)=> {
        console.log("old state:", oldState);
        return [...oldState, data ]
      })
    };

    websocket.addEventListener("message", listener)

    return ()=>{
      console.log("component did unmount")
      websocket.send(JSON.stringify({
        path: "chat",
        action: "exit"
      }))
      websocket.removeEventListener("message", listener)
    }
  }, [])

  console.log("new state", messages)

  return (
    <ul>{
      messages.map((message)=>{
        return(
          <li key={message.id}>
            <span>{message.userName}: </span>
            <pre>{message.message}</pre>
          </li>
        )
      })
    }</ul>
  );
}
