import React, { Component, useEffect, useRef } from "react"

import {
  prepareWebRTC, WebRTCConns
} from "../prepare-webrtc";

import { setupFilesFn } from "./setup-files"

/*

- ensure all people ae connected
- ensure they are on the same timestamp

*/

type Props = {
  websocket: WebSocket;
  gameId: string;
  self: string;
  users: Array<string>
}

export class GameIframe extends Component<Props> {
  // iframeRef: void | HTMLIFrameElement;
  iframeWindow: void | Window;
  timeout;
  unmounted = false;
  runningFrame = false;
  lastFrameTime: number = 0;

  webrtcConnections: WebRTCConns | void;


  constructor(a, b){
    super(a, b);
    this.handleRef = this.handleRef.bind(this)
    this.runFrame = this.runFrame.bind(this);
    this.messageListener = this.messageListener.bind(this)
  }

  async componentDidMount(){
    const gameId = this.props.gameId;
    this.webrtcConnections = await prepareWebRTC({
      websocket: this.props.websocket,
      self: this.props.self,
      userList: this.props.users
    });


  }


  handleRef(c:HTMLIFrameElement){
    this.iframeWindow = c.contentWindow;
    this.iframeWindow.addEventListener("message",this.messageListener)
  }

  runFrame(){
    if(this.unmounted) return;
    if(!this.iframeWindow) return;
    this.lastFrameTime = Date.now();
    this.runningFrame = true;
    this.iframeWindow.postMessage("start frame");
  }

  messageListener(e: MessageEvent<any>){
    if(this.unmounted) return;
    if(!this.runningFrame) return
    var message = e.data;
    if(message !== "finish frame") return;
    this.runningFrame = false;
    this.timeout = setTimeout(
      this.runFrame,
      (1000 / 60) - (Date.now() - this.lastFrameTime)
    );
  }


  componentWillUnmount(){
    this.unmounted = true;
    if(this.iframeWindow){
      this.iframeWindow.removeEventListener("message", this.messageListener)
    }
    clearTimeout(this.timeout);
    this.webrtcConnections && Object.values(this.webrtcConnections).forEach((webRtcCon)=>{
      webRtcCon.rtcCon.close()
    })
  }

  render(){
    return (
      <iframe
        frameBorder="0"
        marginHeight={0}
        marginWidth={0}

        width="100%"
        height="100%"
        scrolling="auto"

        style={
          {
           display: "block",
           width: "100%" ,
           border: "none",
           overflowY: "auto",
           overflowX: "hidden",
          }
        }

        ref={this.handleRef}
        srcDoc={`
          <!DOCTYPE html>
          <html>
            <head>

            </head>
              <body>
                <h1>Content inside an iframe, who knew...</h1>
              </body>
              <script type="text/javascript">
                const gameId = ${this.props.gameId};
                ${setupFilesFn}
                (async function(){
                  await new Promise((res, rej)=>{
                    var timeout = setTimeout(()=>{
                      window.top.removeEventListener("message", listener);
                      rej("Didn't respond in time")
                    }, 10 * 1000);
                    const listener = (e)=>{
                      window.top.removeEventListener("message", listener);
                      clearTimeout(timeout);
                      console.log("responded in time")
                      var message = e.data;
                    };

                    window.top.addEventListener("message", listener)
                    window.top.postMessage(
                      JSON.stringify({
                        error: false,
                        message: "Hello World"
                      })globals browser,
                      '*'
                    );
                  })

                  const {
                    jsFile, files, getFile
                  } = await setupFiles(gameId)



                  var prepared = false;

                  var game = require("game");
                  await game.prepareGame()

                  window.top.postMessage("finished prepare")

                  window.addEventListener("message", (e)=>{
                    var message = e.data;
                    if(message !== "start frame") return;
                    game.runFrame();
                    e.source.postMessage("finish frame")
                  })
                })()

              </script>
            </html>
          `}
      />
    )
  }
}
