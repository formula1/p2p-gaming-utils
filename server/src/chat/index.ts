
type animal = {
  species?: string,
  name: string
}

var animalValue: animal = {
  name: "vv",
}

enum animalSpecies {
  "hello" = "hello",

}


class Chat {
  users:
}
function setupChat(){
  var users = {};
  var clans = {};
  var gameLobbys = {};

  function setupClient(client){
    var userId = client.user._id

    users[userId] = client;
    client.on("join-room", (roomName)=>{
      joinClan(clanName, client)
    })

    client.on("leave-room", (roomName)=>{

    })

    client.on("chat-message", (type, target, message)=>{

    })
  }

  function joinRoom(clanName: string, client){
    var userId = client.user._id
    if(!(clanName in clans)){
      clans[clanName] = {}
    }
    var clan = clans[clanName];
    if(!(userId in clan)){
      clan[userId] = client
    }
  }

  function leaveRoom(roomName: string, client){

  }

  function onRecieveMessage(type, target, message){
    switch(type){
      case "clan":

      case "user":
      default {
        throw new Error("")
      }
    }
  }

  function broadcastToGameLobby(){

  }

  function broadcastToClan(clanName, message){
    Object.values(clans[])

  }

  function sendToUser(userId, message){

  }


}

export {
  setupChat
}
