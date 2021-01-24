import { Strategy } from "passport";
import * as path from "path";
import { Document } from "mongoose";
import { Request } from "express";
import {
  UserLoginModel
} from "../models/UserLogin"

import {
  IUser
} from "../models/User"

type StrategyArg = {
  strategyName: string,
  locationOrigin:  string, // https://www.w3schools.com:4097
}

type Profile = {
  id: string
  displayName: string,
  username: string,
  profileUrl: string,
  emails: Array<{ value: string }>,
  photos: Array<{ value: string }>
}

function createStrategy(arg: StrategyArg): Strategy {

  var { Strategy } = require(arg.strategyName);
  var clientInfoJSON = require(path.join(__dirname, 'hidden', `${arg.strategyName}.json`));

  return new Strategy(
    {
      ...clientInfoJSON,
      callbackURL: `${arg.locationOrigin}/auth/${arg.strategyName}/callback`,
      passReqToCallback: true
    },
    function(
      req: Request,
      accessToken: any,
      refreshToken: any,
      profile: Profile,
      cb: (error: any, user: void | Document)=>any
    ) {

      if(req.user){
        UserLoginModel.addLoginForUser({
          userId: (req.user as IUser)._id,
          strategy: arg.strategyName,
          profileId: profile.id,
        }).then((user)=>{
          return cb(void 0, user);
        }, (err)=>{
          return cb(err, void 0)
        })

      }else{
        UserLoginModel.findOrCreateUser({
          strategy: arg.strategyName,
          profileId: profile.id,
          userName: profile.displayName
        }).then((user)=>{
          return cb(void 0, user);
        }, (err)=>{
          return cb(err, void 0)
        });
      }

    }
  );
}

export {
  createStrategy
}
