import React, { useEffect, useRef } from "react"

/*

- ensure all people ae connected
- ensure they are on the same timestamp

*/

function GameInstance(){
  var frameId = 0;
  const iframeRef: unknown = useRef();
  var iframeWindow;
  var messageListener;
  var timeout;
  useEffect(() => {
    const handler = event => {
      const data = JSON.parse(event.data)
      console.log("Hello World?", data)
    }

    window.addEventListener("message", handler)

    // clean up
    return () => window.removeEventListener("message", handler)
  }, []) // empty array => run only once

  useEffect(()=>{
    return ()=>{
      iframeWindow.removeEventListener("message", messageListener)
      clearTimeout(timeout);
    }
  }, [])

  function initializeFrame(){
    iframeWindow = (iframeRef as HTMLIFrameElement).contentWindow;
    var runningFrame = false;
    var lastFrameTime: number = 0;
    messageListener = (e: MessageEvent<any>)=>{
      if(!runningFrame) return
      var message = e.data;
      runningFrame = false;
      if(message === "finish frame"){
        timeout = setTimeout(runFrame, (1000 / 60) - (Date.now() - lastFrameTime));
      }
    }

    iframeWindow.addEventListener("message", messageListener)
    runFrame()
  }



  return (
    <iframe
      ref={iframeRef}
      frameborder="0"
      marginheight="0"
      marginwidth="0"

      srcDoc={`
        <!DOCTYPE html>
        <html>
          <head>

          </head>
            <body>
              <h1>Content inside an iframe, who knew...</h1>
            </body>
            <script type="text/javascript">
              (async function(){
                window.top.postMessage(
                  JSON.stringify({
                    error: false,
                    message: "Hello World"
                  }),
                  '*'
                );

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
