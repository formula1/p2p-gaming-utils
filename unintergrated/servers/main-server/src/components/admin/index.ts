import { Router } from "express";
import { UserModel } from "../../models/User";
import { passport } from "../../utils/passport";


export function createRouter(){
  var router = Router();
  router.get("/users", passport.authenticate('jwt', {session: false}), (req, res, next)=>{
    if(!req.user){
      return next({
        status: 403,
        message: "No User"
      })
    }
    console.log("get users");
    UserModel.find({}).exec().then((users)=>{
      res.status(200).json(users)
    }).catch(next)
  })

  router.get("/users/:id", passport.authenticate('jwt', {session: false}), (req, res, next)=>{
    if(!req.user){
      return next({
        status: 403,
        message: "No User"
      })
    }
    console.log("get users");
    UserModel.findById(req.params.id).exec().then((user)=>{
      res.status(200).json(user)
    }).catch(next)
  })

  return router;
}
