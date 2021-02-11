import { Passport } from "passport";
import { Router, Request, Response, NextFunction } from "express";

type PassportSetupReturn = {
  passport: any,
  router: Router,
  middleware: Router | ((req: Request, res: Response, next: NextFunction)=>any)
}

export {
  PassportSetupReturn
}
