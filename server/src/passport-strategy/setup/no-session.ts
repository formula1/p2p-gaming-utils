import { Router, Request, Response, NextFunction } from "express";
import { Passport } from "passport";
import {
  UserModel, IUser
} from "../../models/User";
import {
  UserLoginBasicModel
} from "../../models/UserLoginBasic"
import {
  UserSessionModel
} from "../../models/UserSession"

import { Connection } from "mongoose"

import multer from "multer";

import {
  setupStrategy
} from "../bearer-token-strategy";

import { PassportSetupReturn } from "../types";

type CreateRouterArg = {
  strategyFolder: string,
  locationOrigin:  string, // https://www.w3schools.com:4097
  sessionSecret: string,
  mongooseConnection: Connection
};

function setupPassport(arg: CreateRouterArg): PassportSetupReturn{
  const upload = multer();

  const passport = new Passport();
  const router = Router();
  const middleware = function(req: Request, res: Response, next: NextFunction){
    passport.authenticate('bearer', { session: false })(req, res, (err: any)=>{
      if(err){
        console.error("bearer authenticate:", err);
        return next(err)
      }
      const user = req.user as void | IUser;
      console.log(user ? "Has User " + user._id : "No User");
      next()
    })
  };

  passport.serializeUser(function(user: IUser, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id: string, done) {
    UserModel.findById(id, function (err: any, user: IUser) {
      done(err, user);
    });
  });
  const strategy = setupStrategy();
  passport.use(strategy)

  router.post('/login', upload.none(), (req, res)=>{
    console.log("login")
    var { email, password } = req.body;
    UserLoginBasicModel.loginUser(
      {email, password}
    ).then((token)=>{
      res.status(200).json({token});
    }, (err)=>{
      res.status(401).json({
        error: true,
        message: err.message
      })
    })
  })


  router.post('/register', upload.none(), (req, res)=>{

    console.log("register")
    var { username, email, password } = req.body;
    UserLoginBasicModel.registerUser(
      {username, email, password}
    ).then((token)=>{
      res.status(200).json({token});
    }, (err)=>{
      res.status(401).json({
        error: true,
        message: err.message
      })
    })
  })

  router.get("/user/:id", middleware, (req, res)=>{
    if(!req.user){
      res.status(401).json({})
    }else{
      UserModel.findById(req.params.id).then((item)=>{
        if(!item){
          res.status(404).json({})
        }
        res.status(200).json(item)
      })
    }
  })

  router.get('/self', middleware, (req, res)=>{
    if(!req.user){
      res.status(200).json({})
    }else{
      res.status(200).json(req.user)
    }
  })

  router.get('/logout', middleware, (req, res)=>{
    if(!req.user){
      return res.status(401).json({
        error: true,
        message: "not logged in"
      })
    }
    UserSessionModel.logout((req as any).token).then((user)=>{
      return res.status(200).json({
        ok: true
      })
    }, (err)=>{
      return res.status(500).json({
        error: true,
        message: err.message
      })
    });
  })

  router.use((req, res)=>{
    res.status(404).json({
      error: true,
      message: "Page not found"
    })
  })

  return {
    passport,
    router,
    middleware
  }
}

export {
  setupPassport
};
