import {
  Response
} from "express";

function throwStatus(res: Response, code: number, message: string){
  return res.status(code).json({
    error: true,
    message: message
  })
}

export {throwStatus}
