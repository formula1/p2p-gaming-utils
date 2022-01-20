import * as React from "react";

import {
  Navigate
} from "react-router-dom";

import {
  useAuth
} from "../../context/user";

function RequireUser({children}: { children: React.ReactNode}){
  const auth = useAuth();

  if(!auth.user){
    return (
      <Navigate
        to={{ pathname: "/login", }}
      />
    )
  }

  return <>{children}</>;
}

export {
  RequireUser
};
