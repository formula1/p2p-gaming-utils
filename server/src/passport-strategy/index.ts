import { Router } from "express";
import { createStrategy } from "./create-strategy";
import { Passport } from "passport";
import {
  UserModel, IUser
} from "../models/User";


type CreateRouterArg = {
  strategies: Array<string>,
  locationOrigin:  string, // https://www.w3schools.com:4097
  sessionSecret: string
};

function setupPassport(arg: CreateRouterArg){
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

  router.use(require('cookie-parser')());
  router.use(require('express-session')({
    secret: arg.sessionSecret, resave: true, saveUninitialized: true
  }));
  router.use(passport.initialize());
  router.use(passport.session());

  router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

  arg.strategies.forEach((strategyName)=>{
    var strategy = createStrategy({
      strategyName: strategyName,
      locationOrigin: arg.locationOrigin
    });
    passport.use(strategy)

    router.get(`/auth/${strategyName}`,
      passport.authorize(strategyName, { failureRedirect: '/logout' })
    );

    router.get(`/auth/${strategyName}/callback`,
      passport.authorize(strategyName, { failureRedirect: '/logout' }),
      function(req, res) {
        var user = req.user;
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
