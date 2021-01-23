import { Router } from "express";
import { createStrategy } from "./create-strategy";
import { Passport } from "passport";
import {
  UserModel, IUser
} from "../models/User";
import session from 'express-session';
import MongoStoreCreate from 'connect-mongo';
import CookieParser from "cookie-parser";
import { Connection } from "mongoose"
import * as fs from "fs";
import * as path from "path"

type CreateRouterArg = {
  strategyFolder: string,
  locationOrigin:  string, // https://www.w3schools.com:4097
  sessionSecret: string,
  mongooseConnection: Connection
};

function setupPassport(arg: CreateRouterArg){

  const MongoStore = MongoStoreCreate(session);

  const passport = new Passport();
  const router = Router();

  passport.serializeUser(function(user: IUser, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id: string, done) {
    UserModel.findById(id, function (err: any, user: IUser) {
      done(err, user);
    });
  });

  router.use((req, res, next)=>{
    console.log("passport router");
    next();
  })
  router.use(CookieParser());
  router.use(
    session({
        secret: arg.sessionSecret,
        resave: true,
        saveUninitialized: true,
        store: new MongoStore({
          mongooseConnection: arg.mongooseConnection
        })
    })
  );
  router.use(passport.initialize());
  router.use(passport.session());

  router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

  fs.readdirSync(arg.strategyFolder).forEach((strategyJson)=>{

    const strategyName = path.basename(strategyJson, '.json');
    console.log()
    var strategy = createStrategy({
      strategyName: strategyName,
      locationOrigin: arg.locationOrigin
    });
    console.log(strategyName, strategy)
    passport.use(strategy)

    router.get(`/auth/${strategyName}`,
      passport.authorize(strategy.name, { failureRedirect: '/logout' })
    );

    router.get(`/auth/${strategyName}/callback`,
      passport.authorize(strategy.name, { failureRedirect: '/logout' }),
      function(req, res) {
        var user = req.user;
        console.log(user);
        res.redirect("/");
      }
    );
  })

  return {
    passport,
    router
  }
}

export {
  setupPassport
};
