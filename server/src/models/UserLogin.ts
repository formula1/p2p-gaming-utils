import { model, ObjectId, Model, Schema, Types, Document } from "mongoose";

import {
  UserModel, IUser
} from "./User";

const ObjectId = Types.ObjectId;

interface IUserLogin extends Document {
  user: ObjectId,
  strategy: String,
  profileId: String
}

const UserLoginSchema = new Schema({
  user: ObjectId,
  strategy: String,
  profileId: String
});

UserLoginSchema.methods.findUser = function(cb) {
  model("User").findById((this as any).user, cb)
};

type FindOrCreateArg = {
  strategy: string,
  profileId: string,
  userName: string
}

type StaticFunctions = {
  findOrCreateUser: (arg: FindOrCreateArg)=>Promise<Document<IUser>>
}

UserLoginSchema.static(
  'findOrCreateUser', function({
    strategy,
    profileId,
    userName
  }: FindOrCreateArg): Promise<Document<IUser>> {
    const User = model("User");
    const UserLogin = model("UserLogin");
    return UserLogin.findOne(
      {
        strategy,
        profileId
      }
    ).exec().then((userLogin: IUserLogin): Promise<Document<IUser>>=>{
      if(userLogin){
        return User.findById(userLogin.user).exec();
      }
      return User.create({
        name: userName
      }).then((user: IUser)=>{
        return UserLogin.create({
          user: user._id,
          strategy: strategy,
          profileId: profileId
        }).then(()=>{
          return user;
        })
      });
    });
  }
);

const UserLoginModel: Model<IUserLogin> & StaticFunctions = model("UserLogin", UserLoginSchema) as any;

export {
  UserLoginModel, IUserLogin
}
