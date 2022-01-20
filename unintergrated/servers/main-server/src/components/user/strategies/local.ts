import {Strategy as LocalStrategy} from "passport-local";
import { UserLoginBasicModel } from "../../../models/Login";

const localStrategy = new LocalStrategy(
  {
    passReqToCallback: true,
    usernameField: 'email',
    passwordField: 'password',
  },
  function(req, email, password, done) {
    var register = (req as any & { register: boolean }).register;

    if(register){
      if(!req.body.username){
        return done("need username");
      }
      UserLoginBasicModel.registerUser({
        username: req.body.username, email, password
      }).then((user)=>{
        if(!user){
          return done(null, void 0);
        } else {
          return done(null, user);
        }
      }).catch((err)=>{
        console.error("register error:", err)
        done(err);
      })
    }else{
      return UserLoginBasicModel.loginUser(
        { email: email, password: password }
      ).then((user)=>{
        if(!user){
          return done(null, void 0)
        } else {
          return done(null, user)
        }
      }).catch(done);
    }
  }
);

export {
  localStrategy
};
