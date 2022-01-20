import {passport} from "../../../utils/passport";
import { localStrategy } from "../strategies/local";
import { Router } from "express";
import { json as bodyParserJSON } from "body-parser";

import { createJWT } from "./create-jwt"
import { IUser } from "../../../models/User";

passport.use(localStrategy);


export function createRouter() {
  var router = Router();

  router.get("/user", passport.authenticate('jwt', {session: false}), (req, res, next)=>{
    if(!req.user){
      return next("No User");
    }
    res.status(200).json(req.user);
  })

  router.get("/refresh", (req, res, next)=>{
    console.log("refresh before auth");
    passport.authenticate('jwt', {session: false}, (err: null | any, user: IUser | void, info: any)=>{
      console.log("refresh after auth:", user, info);
      if(err){
        return res.status(500).json({ errors: err })
      }
      if(!user){
        return res.status(404).json({ errors: "user not found" })
      }
      req.logIn(user, {session: false}, (err)=>{
        if(err){
          return res.status(500).json({ errors: err })
        }

        const response = createJWT(user);
        return res.status(200).json(response);
      })
    })(req, res, next);
  })

  router.post("/register/", bodyParserJSON(), (req, res, next)=>{
    (req as any).register = true;
    passport.authenticate("local", (err: null | any, user: IUser | void, info: any)=>{
      if(err){
        return res.status(500).json({ errors: err })
      }
      if(!user){
        return res.status(404).json({ errors: "user not found" })
      }
      req.logIn(user, {session: false}, (err)=>{
        if(err){
          return res.status(500).json({ errors: err })
        }

        const response = createJWT(user);
        return res.status(200).json(response);
      })
    })(req, res, next)
  })

  router.post("/login/", bodyParserJSON(), (req, res, next)=>{
    passport.authenticate("local", (err: null | any, user: IUser | void, info: any)=>{
      if(err){
        return res.status(500).json({ errors: err })
      }
      if(!user){
        return res.status(404).json({ errors: "user not found" })
      }
      req.logIn(user, {session: false}, (err)=>{
        if(err){
          return res.status(500).json({ errors: err })
        }
        const response = createJWT(user);
        return res.status(200).json(response);
      })
    })(req, res, next)
  })

  return router;
}
