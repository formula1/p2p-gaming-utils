import { WebSocket } from 'ws';
import { GameLobbyModel } from "../models/GameLobby";
import { IUser } from "../../models/User";

type WsItem = {
  id: string;
  ws: Array<WebSocket>;
  lobbyId: string;
  user:IUser;
}

type Rooms = {
  [roomId: string]: {
    [wsId: string]: WsItem
  }
}

export const rooms: Rooms = {};

export async function listenToRoomList(){

}

// When room is created, update the game lobby list
export async function createRoom(){

}



export async function joinTheRoom(lobbyId: string, user: IUser, ws: WebSocket){
  var lobby = await GameLobbyModel.findById(lobbyId);
  if(!lobby) throw new Error(`No Lobby with id ${lobbyId} exists`);
  if(!(lobbyId in rooms)){
    rooms[lobbyId] = {}
  }
  const userId = user._id
  if(!(userId in rooms[lobbyId])){
    rooms[lobbyId][userId] = {
      id: userId,
      ws: [],
      lobbyId: lobbyId,
      user: user
    };
  }

  rooms[lobbyId][userId].ws.push(ws)

  ws.on("message", async (message)=>{
    var json = JSON.parse(message.toString("utf8"));
    if(json.path === "chat"){
      json.id = Date.now().toString(16) + Math.random().toString(16).substring(2),
      json.userName = user.name
      return broadcastToRoom(lobbyId, json)
    }
  })

  ws.on("close", ()=>{
    if(!(lobbyId in rooms)){
      return "lobby already closed";
    }
    rooms[lobbyId][userId].ws = rooms[lobbyId][userId].ws.filter((storedWs)=>{
      return storedWs !== ws;
    })
    if(rooms[lobbyId][userId].ws.length === 0){
      delete rooms[lobbyId][userId];
    }
    if(Object.keys(rooms[lobbyId]).length === 0){
      delete rooms[lobbyId];
    } else {
      broadcastToRoom(lobbyId, {
        id: Date.now().toString(16) + Math.random().toString(16),
        path: "chat",
        userName: "BOT",
        message: `user ${user.name} has left the lobby`
      })
    }
  })

  broadcastToRoom(lobbyId, {
    id: Date.now().toString(16) + Math.random().toString(16),
    path: "chat",
    userName: "BOT",
    message: `user ${user.name} has entered the lobby`
  })

}


export async function destroyRoom(user: IUser, roomId: string){
  var lobby = await GameLobbyModel.findById(roomId);
  if(lobby.host.toString() !== user._id.toString()){
    throw new Error(
      `room host ${lobby.host} is not the user ${user._id}`
    )
  }
  await lobby.deleteOne()
  broadcastToRoom(roomId, {
    path: "/delete-room"
  });
  closeAllSockets(roomId)
  delete rooms[roomId];
}

function broadcastToRoom(lobbyId: string, message: any){
  if(!(lobbyId in rooms)){
    return;
  }
  console.log("broadcatsing:", lobbyId, message);
  Object.values(rooms[lobbyId]).forEach((item)=>{
    item.ws.forEach((ws)=>{
      ws.send(JSON.stringify(message))
    })
  })
}

function closeAllSockets(lobbyId: string){
  if(!(lobbyId in rooms)){
    return;
  }
  Object.values(rooms[lobbyId]).forEach((wsItem)=>{
    wsItem.ws.forEach((ws)=>{
      ws.close()
    })
  })
}
