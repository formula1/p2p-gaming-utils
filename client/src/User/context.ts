import * as React from "react";

import {
  UserSubmit
} from "./types";

const UserContext = React.createContext({
  user: void 0,
  strategies: [],
  updateUser: ((body: UserSubmit)=>{})
});
UserContext.displayName = 'SelfUser';
export {
  UserContext
}
