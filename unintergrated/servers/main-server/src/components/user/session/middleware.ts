import {mongoose} from '../../../utils/mongoose';
const { MONGO_URL } = require("../../constants/mongodb");
import { SESSION_SECRET } from "../../../constants/session";
const { Router } = require("express");
const session = require("express-session")
const MongoStore = require("connect-mongo");
const passport = require("../../utils/passport");
var cookieParser = require('cookie-parser')

function passportSession(){
  console.log(mongoose.connection);
  const router = new Router()
  router.use(cookieParser());
  router.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      store: MongoStore.create({
        mongoUrl: MONGO_URL
        // mongooseConnection: mongoose.connection
      })
    })
  )

  router.use(passport.initialize());
  router.use(passport.session());

}

export {
  passportSession
}
