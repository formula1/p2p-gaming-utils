import { Strategy } from "passport";
import * as path from "path";
import { Document } from "mongoose";
import { Request } from "express";
import {
  UserLoginBasicModel
} from "../models/UserLoginBasic"

import { BasicStrategy } from "passport-http";
import {
  IUser
} from "../models/User"

import { Passport } from "passport";

function setupStrategy(){

  const basicStrategy = new BasicStrategy(
    {
      passReqToCallback: true
    },
    function(
      req: Request,
      email: string,
      password: string,
      cb: (error: any, user: void | Document)=>any
    ) {
      UserLoginBasicModel.findUserByCredentials({ email, password }).then((user)=>{
        cb(null, user)
      }, (err)=>{
        console.error(err);
        if(err) return cb(err)
      });
    }
  )

  return basicStrategy;
}

function setupHeaderStrategy(){

}

export {
  setupStrategy
};
