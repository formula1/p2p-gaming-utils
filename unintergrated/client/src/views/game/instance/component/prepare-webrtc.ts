
type Args = {
  websocket: WebSocket;
  self: string;
  userList: Array<string>;
}

type WebRTCCon = {
  id: string;
  rtcCon: RTCPeerConnection;
  dataCon: RTCDataChannel | void
}

type WebRTCConns = {
  [id: string]: WebRTCCon
}

export { WebRTCConns };

// https://developer.mozilla.org/en-US/docs/Web/API/RTCIceServer#example
const WebRTCConfig = {
  "iceServers": [{ "urls": ["stun:stun.1.google.com:19302"] }]
};

export async function prepareWebRTC({ websocket, self, userList }: Args): Promise<WebRTCConns>{
  const webrtcConnections = userList.reduce((conns, user)=>{
    if(user === self){
      console.log("don't need to connect with self")
      return conns;
    }
    const rtcCon = new RTCPeerConnection(WebRTCConfig);
    return {
      ...conns,
      [user]: {
        id: user,
        rtcCon: rtcCon,
        dataCon: void 0
      }
    }
  }, {})

  websocket.addEventListener("message", async (e)=>{
    try {
      const json = JSON.parse(e.data);
      var user: string;
      userList.some((userItem)=>{
        if(userItem === json.user){
          user = userItem
          return true;
        }
      })
      if(user === void 0){
        throw new Error("user sender " + json.user + " is not in user list")
      }

      const item = webrtcConnections[user]

      switch(json.type){
        case "ice":
          return item.rtcCon.addIceCandidate(new RTCIceCandidate(json.value))
        case "offer": {
          if(self.localeCompare(user) < 0){
            throw new Error("self [" + self + "] should offer, not answer")
          }
          await item.rtcCon.setRemoteDescription(json.value)
          const answer = await item.rtcCon.createAnswer();
          item.rtcCon.setLocalDescription(answer)
          websocket.send(JSON.stringify({
            user: self,
            target: user,
            type: "answer",
            value: answer
          }))
          return;
        }
        case "answer":{
          if(self.localeCompare(user) > 0){
            throw new Error("self [" + self + "] should answer, not offer")
          }
          await item.rtcCon.setRemoteDescription(json.value)
          return;
        }
      }
    }catch(e){
      console.error(e);
    }
  })


  const promises = Promise.all(
    userList.map((user): Promise<void>=>{
      return new Promise(async (res, rej)=>{
        if(user === self){
          console.log("don't need to connect with self")
          return res();
        }
        // https://developer.mozilla.org/en-US/docs/Web/API/RTCIceServer#example
        const item = webrtcConnections[user];
        const rtcCon = item.rtcCon;
        rtcCon.addEventListener('icecandidate', (e) => {
          websocket.send(JSON.stringify({
            user: self,
            target: user,
            type: "ice",
            value: e.candidate
          }))
        });
        if(self.localeCompare(user) > 0){
          item.dataCon = rtcCon.createDataChannel("game", {
            ordered: true
          })
          item.dataCon.onopen = ()=>{
            res()
          }
          const offer = await item.rtcCon.createOffer();
          await rtcCon.setLocalDescription(offer)
          websocket.send(JSON.stringify({
            user: self,
            target: user,
            type: "offer",
            value: offer
          }))
        } else {
          rtcCon.ondatachannel = (event)=>{
            item.dataCon = event.channel
            item.dataCon.onopen = ()=>{
              res()
            }
          }
        }
      })
    })
  )

  websocket.send("ready-for-rtc");

  return promises.then(()=>{
    return webrtcConnections
  });
}
