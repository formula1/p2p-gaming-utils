import { model, Model, Types, Schema, Document } from "mongoose";

const ObjectId = Types.ObjectId;

interface IGameLobbyProperties extends Document {
  lobbyName: string;
  fileId: string;
  host: Types.ObjectId;
  minPlayers: number;
  maxPlayers: number;
  joined: Array<Types.ObjectId>,
  banned: Array<Types.ObjectId>,
}

interface IGameLobby extends IGameLobbyProperties {
  joinLobby: (userId: Types.ObjectId)=>any;
  kickUser: (userId: Types.ObjectId)=>any;
  banUser: (userId: Types.ObjectId)=>any;
}

const GameLobbySchema = new Schema({
  lobbyName: { type: String, require: true },
  fileId: { type: String, require: true },
  host: { type : ObjectId, ref: "User", require: true },
  minPlayers: { type : Number, require: true },
  maxPlayers: { type : Number, require: true },
  joined: [{ type: ObjectId, ref: "User" }],
  banned: [{ type: ObjectId, ref: "User" }],
});

GameLobbySchema.methods.joinLobby = async function(userId: Types.ObjectId){
  const _this = this as IGameLobby;
  if(_this.maxPlayers === _this.joined.length){
    return Promise.reject(
      new Error("already at maximum players")
    )
  }
  if(_this.banned.some((bannedUser)=>{
    return bannedUser === userId
  })){
    return Promise.reject(
      new Error("this player has been banned")
    )
  }
  if(_this.joined.some((joinedUser)=>{
    return joinedUser === userId
  })){
    return Promise.reject(
      new Error("this player has already joined this game")
    )
  }
  _this.joined.push(userId);
  return _this.save();
}

GameLobbySchema.methods.kickUser = async function(userId: Types.ObjectId){
  const _this = this as IGameLobby;
  _this.joined = _this.joined.filter((joinedUser)=>{
    return joinedUser !== userId
  });
  return _this.save();

}

GameLobbySchema.methods.banUser = async function(userId: Types.ObjectId){
  const _this = this as IGameLobby;
  if(_this.banned.some((bannedUser)=>{
    return bannedUser === userId
  })){
    return Promise.reject(
      new Error("this player has already been banned")
    )
  }
  _this.banned.push(userId);
  _this.joined = _this.joined.filter((joinedUser)=>{
    return joinedUser !== userId
  });
  return _this.save();
}

const GameLobbyModel = model<IGameLobby>('Profile', GameLobbySchema);

export {
  IGameLobby,
  GameLobbyModel
}
