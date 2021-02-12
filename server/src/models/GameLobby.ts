import { model, Model, Schema, Types, Document } from "mongoose";

import {
  Queue
} from "../utils/promise-utils";

enum TypeOfGame {
  "TurnBased" = "TurnBased",
  "SameTurn" = "SameTurn",
  "LockStep" = "LockStep",
  "RollBack" = "RollBack"
}

const TypeOfGameValues = [
  TypeOfGame.TurnBased,
  TypeOfGame.SameTurn,
  TypeOfGame.LockStep,
  TypeOfGame.RollBack
]
const ObjectId = Types.ObjectId;
type ObjectId = Types.ObjectId;

type MethodFunctions = {
  startLobby: ()=>any,
  joinLobby: (userId: string)=>Promise<any>,
  leaveLobby: (userId: string)=>Promise<any>
  cancelLobby: ()=>any
}

interface IGameLobby extends Document, MethodFunctions {
  name: string;
  creator: ObjectId;
  created: Date;

  minUsers: number,
  maxUsers: number;
  typeOfGame: TypeOfGame
  users: Array<ObjectId>
  started: boolean
}

const GameLobbySchema = new Schema({
  name: {
    type: String,
    unique: true
  },
  creator: ObjectId,
  created: { type: Date, default: Date.now },

  minUsers: {type: Number, default: 2},
  maxUsers: {type: Number, default: 2},
  typeOfGame: {
    type: String,
    enum : TypeOfGameValues,
    default: "TurnBased"
  },
  users: [{ type: ObjectId }],
  started: {
    type: Boolean,
    default: false
  }
});

const joinLobbyQueue = new Queue();

GameLobbySchema.methods.startLobby = async function(){
  var _this = (this as IGameLobby);
  return joinLobbyQueue.run(()=>{
    const GameLobbyModel = model("GameLobby");
    if(_this.users.length < _this.minUsers){
      return Promise.reject(new Error("Not enough users to start game"));
    }
    if(_this.started){
      return Promise.reject(new Error("The game has already started"));
    }
    _this.started = true;
    return this.save();
  });
};

GameLobbySchema.methods.joinLobby = function(user: string) {
  var _this = (this as IGameLobby);

  return joinLobbyQueue.run(()=>{
    if(_this.started){
      throw new Error("The game has already started");
    }
    if(_this.maxUsers === _this.users.length){
      throw new Error("already at max users");
    }
    if(_this.users.some((userId)=>{
      return userId.toString() == user;
    })){
      throw new Error("already joined");
    }
    _this.users.push(ObjectId(user));
    return _this.save();
  })
};

GameLobbySchema.methods.leaveLobby = function(user: string) {
  var _this = (this as IGameLobby);

  return joinLobbyQueue.run(()=>{
    if(_this.started){
      throw new Error("The game has already started");
    }
    if(!_this.users.some((userId)=>{
      return userId.toString() === user
    })){
      throw new Error("Not Joined")
    }

    _this.users = _this.users.filter((userId)=>{
      return user !== userId.toString()
    })

    return _this.save();
  })
};

GameLobbySchema.methods.cancelLobby = async function(){
  const GameLobbyModel = model("GameLobby");
  return await GameLobbyModel.deleteOne({ _id: this._id });
}

type StaticFunctions = {
  getAvailableGames: ()=>Promise<Array<Document<IGameLobby>>>,
  getHostedGames: (creatorId: string)=>Promise<Array<Document<IGameLobby>>>
}

GameLobbySchema.static(
  'getAvailableGames', function(): Promise<Array<Document<IGameLobby>>> {
    const GameLobbyModel = model("GameLobby");
    var q = GameLobbyModel.find({
      started: false,
    })
    q.$where('this.users.length < this.maxUsers');
    return q.exec().then((gameLobbies: Array<Document<IGameLobby>>): Array<Document<IGameLobby>>=>{
      console.log(gameLobbies);
      return gameLobbies;
    });
  }
);

GameLobbySchema.static(
  'getHostedGames', function(creatorId: string): Promise<Array<Document<IGameLobby>>> {
    const GameLobbyModel = model("GameLobby");
    var q = GameLobbyModel.find({
      creator: creatorId,
    })
    return q.exec().then((gameLobbies: Array<Document<IGameLobby>>): Array<Document<IGameLobby>>=>{
      console.log(gameLobbies);
      return gameLobbies;
    });
  }
);



const GameLobbyModel: Model<IGameLobby> & StaticFunctions = model('GameLobby', GameLobbySchema) as any;

export {
  IGameLobby,
  GameLobbyModel,
  TypeOfGameValues,
  TypeOfGame
}
