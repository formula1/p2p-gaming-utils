//passport.js
import {Strategy as JWTStrategy, ExtractJwt} from "passport-jwt";
import { JWT_SECRET } from "../../../constants/session";
import {
  UserModel, IUser
} from "../../../models/User";

const jwtStrategy = new JWTStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey   : JWT_SECRET
  },
  function (jwtPayload, cb) {
    if(jwtPayload.expirationDate < Date.now()){
      return cb({
        status: 403,
        message: "Token Expired"
      });
    }
    //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
    return UserModel.findById(jwtPayload.user._id)
    .then(user => {
      return cb(null, user);
    })
    .catch(err => {
      return cb(err);
    });
  }
);

export {
  jwtStrategy
}
