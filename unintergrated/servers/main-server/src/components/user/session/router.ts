import {passport} from "../../../utils/passport";
import { localStrategy } from "../strategies/local";
import { Router } from "express";
import { json as bodyParserJSON } from "body-parser";

passport.use(localStrategy);


export function createRouter() {
  var router = Router();

  router.get("/user", (req, res, next)=>{
    if(!req.user){
      return next("No User");
    }
    res.status(200).json(req.user);
  })

  router.get("/logout", (req, res)=> {
    req.logout();
    res.redirect('/');
  });

  router.post("/register/", bodyParserJSON(), (req, res, next)=>{
    (req as any).register = true;
    passport.authenticate("local", (err, user, info)=>{
      if(err){
        return res.status(500).json({ errors: err })
      }
      if(!user){
        return res.status(404).json({ errors: "user not found" })
      }
      req.logIn(user, (err)=>{
        if(err){
          return res.status(500).json({ errors: err })
        }

        return res.status(200).json({
          success: "successfull logged in",
          user: user
        });
      })
    })(req, res, next)
  })

  router.post("/login/", bodyParserJSON(), (req, res, next)=>{
    passport.authenticate("local", (err, user, info)=>{
      if(err){
        return res.status(500).json({ errors: err })
      }
      if(!user){
        return res.status(404).json({ errors: "user not found" })
      }
      req.logIn(user, (err)=>{
        if(err){
          return res.status(500).json({ errors: err })
        }
        return res.status(200).json({
          success: "successfull logged in",
          user: user
        });
      })
    })(req, res, next)
  })

  return router;
}
