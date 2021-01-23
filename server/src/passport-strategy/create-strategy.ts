import { Strategy } from "passport";
import * as path from "path";
import {
  UserLoginModel
} from "../models/UserLogin"

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
  var clientInfoJSON = require(path.join(__dirname, 'configs', `${arg.strategyName}.json`));

  return new Strategy(
    {
      ...clientInfoJSON,
      callbackURL: `${arg.locationOrigin}/auth/${arg.strategyName}/callback`
    },
    function(accessToken, refreshToken, profile: Profile, cb) {

      console.log(profile);
      UserLoginModel.findOrCreateUser({
        strategy: arg.strategyName,
        profileId: profile.id,
        userName: profile.displayName
      }).then((user)=>{
        return cb(void 0, user);
      }, (err)=>{
        return cb(err)
      });
    }
  );
}

export {
  createStrategy
}
