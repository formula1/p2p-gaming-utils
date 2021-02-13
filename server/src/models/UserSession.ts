import { model, ObjectId, Model, Schema, Types, Document } from "mongoose";

import * as bcrypt from "bcrypt-nodejs"

import {
  UserModel, IUser
} from "./User";

const EXPIRATION_OFFSET = 1000 * 60 * 60 * 24 * 7;

const ObjectId = Types.ObjectId;
interface IUserSessionMethods {
  findUser: ()=>Promise<IUser>;
}

interface IUserSession extends Document, IUserSessionMethods {
  user: ObjectId;
  token: string;
  expirationDate: number;
}

const UserSessionSchema = new Schema({
  user: {
    type: ObjectId,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  expirationDate: {
    type: Number,
    required: true
  },
});

const randomString = function(){
  return Date.now().toString(32) + Math.random().toString(32).substring(2);
}

UserSessionSchema.methods.findUser = function(): Promise<Document<IUser>> {
  return model("User").findById((this as IUserSession).user).exec()
};

interface UserSessionSchemaStatics {
  findUserByToken: (token: string)=>Promise<Document<IUser>>
  loginUserByToken: (token: string)=>Promise<Document<IUser>>
  newSession: (user: ObjectId)=>Promise<IUserSession>
  logout: (token: string)=>Promise<IUserSession>
}


UserSessionSchema.static(
  "findUserByToken",
  function(token: string): Promise<IUser | Document<IUser>>{
    const UserSession = model("UserSession");
    return UserSession.findOne({
      token
    }).then((session: IUserSession)=>{
      return model("User").findById(session.user).exec()
    })
  }
);

UserSessionSchema.static(
  "newSession",
  function(userId: ObjectId): Promise<IUserSession>{
    const UserSession = model("UserSession");
    var userSession = new UserSession({
      user: userId,
      token: randomString(),
      expirationDate: Date.now() + EXPIRATION_OFFSET
    })
    return userSession.save().then((session)=>{
      return session as IUserSession
    })
  }
)

UserSessionSchema.static(
  "loginUserByToken",
  function(token: string): Promise<IUser | Document<IUser>>{
    const UserSession = model("UserSession");
    return UserSession.findOne({
      token
    }).then((session: IUserSession)=>{
      if(session.expirationDate < Date.now()){
        throw new Error("past expiration date")
      }
      session.expirationDate = Date.now() + EXPIRATION_OFFSET
      return session.save().then(()=>{
        return model("User").findById(session.user).exec()
      })
    })
  }
);

UserSessionSchema.static(
  "logout",
  function(token: string): Promise<Document<IUserSession>> {
    const UserSession = model("UserSession");
    return UserSession.findOne({
      token
    }).then((uLB: IUserSession)=>{
      if(!uLB){
        return;
      }
      return uLB.remove()
    })
  }
);

const UserSessionModel: Model<IUserSession> & UserSessionSchemaStatics = model("UserSession", UserSessionSchema) as any;

export {
  UserSessionModel, IUserSession
}
