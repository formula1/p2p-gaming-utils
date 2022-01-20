import {passport} from "../../../utils/passport";
import { jwtStrategy } from "../strategies/jwt";
import { Router } from "express";

passport.use(jwtStrategy);

function passportSession(){
  const router = Router()

  router.use((req, res, next)=>{
    console.log("passport header auth:", req.headers.authorization);
    next();
  })

  router.use(passport.initialize());
  // router.use(passport.session());

  // router.use((req, res, next)=>{
  //   console.log("before jwt")
  //   passport.authenticate('jwt', {session: false}, (a, b, c, d)=>{
  //     var args = Array.from(arguments);
  //     console.log("jwt callback args", args.length, a, b, c, d)
  //   })(req, res, (err: any)=>{
  //     console.log("after jwt", err)
  //     next(err)
  //   })
  // });
  return router;
}

export {
  passportSession
}
