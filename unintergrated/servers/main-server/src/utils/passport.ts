import { Passport } from "passport";

import {
  UserModel,
  IUser
} from "../models/User";

const passport = new Passport();

passport.serializeUser((user: IUser, done: (err: any, userId: string)=>any)=>{
  done(null, user._id)
});

passport.serializeUser((id: string, done: (err: any, user: IUser)=>any)=>{
  UserModel.findById(id, (err: any, user: IUser)=>{
    done(err, user)
  })
});


export {
  passport
}
