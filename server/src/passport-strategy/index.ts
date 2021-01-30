import { Router } from "express";
import { createStrategy } from "./create-strategy";
import { Passport } from "passport";
import {
  UserModel, IUser
} from "../models/User";
import {
  UserLoginModel
} from "../models/UserLogin"

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
  const middleware = Router();

  passport.serializeUser(function(user: IUser, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id: string, done) {
    UserModel.findById(id, function (err: any, user: IUser) {
      done(err, user);
    });
  });

  router.use((req, res, next)=>{
    next();
  })

  middleware.use(CookieParser());
  middleware.use(
    session({
        secret: arg.sessionSecret,
        resave: true,
        saveUninitialized: true,
        store: new MongoStore({
          mongooseConnection: arg.mongooseConnection
        })
    })
  );
  middleware.use(passport.initialize());
  middleware.use(passport.session());

  router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

  router.get('/auth/self', (req, res, next)=>{
    if(!req.user){
      res.status(200).json({})
    }else{
      res.status(200).json(req.user)
    }
  })

  const strategies = fs.readdirSync(arg.strategyFolder).map((strategyJson)=>{
    const strategyName = path.basename(strategyJson, '.json');
    const strategy = createStrategy({
      strategyName: strategyName,
      locationOrigin: arg.locationOrigin
    });
    passport.use(strategy)

    router.get(`/auth/${strategyName}`,
      passport.authenticate(strategy.name, { failureRedirect: '/logout' })
    );

    router.get(`/auth/${strategyName}/callback`,
      passport.authenticate(strategy.name, { failureRedirect: '/logout' }),
      function(req, res) {
        // req.login(user, function(err) {
        //   if (err) { return next(err); }
        //   return res.redirect('/users/' + req.user.username);
        // });

        var user = req.user;
        res.redirect("/");
      }
    );

    return {
      name: strategy.name,
      requireName: strategyName,
      url: `/auth/${strategyName}`
    }
  })

  router.get('/auth/strategies', function(req, res){
    if(!req.user){
      return res.status(200).json(strategies)
    }
    UserLoginModel.find({
      user: (req.user as IUser)._id
    }).exec().then((userLogins)=>{
      if(!userLogins || userLogins.length === 0){
        var taggedStrategies = strategies.map((strategy)=>{
          return {
            ...strategy,
            hasProfile: false
          }
        });
        return res.status(200).json(taggedStrategies)
      }
      var taggedStrategies = strategies.map((strategy)=>{
        return {
          ...strategy,
          hasProfile: userLogins.some((userLogin)=>{
            console.log(userLogin.strategy, strategy.requireName)
            return userLogin.strategy === strategy.requireName
          })
        }
      })
      return res.status(200).json(taggedStrategies)
    })
  });


  return {
    passport,
    router,
    middleware
  }
}

export {
  setupPassport
};
