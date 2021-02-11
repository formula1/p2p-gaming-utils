import { Strategy } from "passport";
import * as path from "path";
import { Document } from "mongoose";
import { Request } from "express";
import {
  UserLoginBasicModel
} from "../models/UserLoginBasic"

import { Strategy as BearerStrategy } from "passport-http-bearer";
import {
  IUser
} from "../models/User"

import { Passport } from "passport";

function setupStrategy(){

  const bearerStrategy = new BearerStrategy(
    {
      passReqToCallback: true
    },
    function(
      req: Request,
      token: string,
      cb: (error: any, user: void | Document)=>any
    ) {
      console.log("token strategy")
      UserLoginBasicModel.findUserByToken(token).then((user)=>{
        console.log("user:", user);
        if(user){
          (req as any).token = token
          return cb(null, user)
        }
        cb(null, void 0)
      }, (err)=>{
        console.error(err);
        if(err) return cb(err)
      });
    }
  )

  return bearerStrategy;
}

export {
  setupStrategy
};
