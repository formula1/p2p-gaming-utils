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

type AddLoginForUserArg = {
  userId: string,
  strategy: string,
  profileId: string,
}

type FindOrCreateArg = {
  strategy: string,
  profileId: string,
  userName: string
}

type StaticFunctions = {
  addLoginForUser: (arg: AddLoginForUserArg)=>Promise<Document<IUser>>,
  findOrCreateUser: (arg: FindOrCreateArg)=>Promise<Document<IUser>>
}

UserLoginSchema.static(
  'addLoginForUser', function({
    userId,
    strategy,
    profileId,
  }: AddLoginForUserArg): Promise<Document<IUser>> {
    const User = model("User");
    const UserLogin = model("UserLogin");
    return Promise.all([
      User.findById(userId).exec(),
      UserLogin.findOne(
        {
          strategy,
          profileId
        }
      ).exec()
    ])
    .then(([user, profile]: [IUser, IUserLogin])=>{
      if(!user){
        throw new Error(`user ${userId} does not exist`)
      }
      if(profile){
        console.log(profile, user);

        if(profile.user.toString() === user._id.toString()){
          return user;
        }
        throw new Error(`profile ${strategy} with id ${profileId} already exists`)
      }
      return UserLogin.create({
        user: user._id,
        strategy: strategy,
        profileId: profileId
      }).then(()=>{
        return user;
      })
    })
  }
)


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
