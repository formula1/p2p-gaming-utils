import * as jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../../../constants/session";
import { IUser } from "../../../models/User";

function createJWT(user: IUser){
  var expirationDate = Date.now() + 1000 * 60 * 60 * 24
  var token = jwt.sign(
    {
      user,
      expirationDate
    }, JWT_SECRET
  );
  return {
    token,
    user,
    expirationDate
  }
}

export {
  createJWT
}
