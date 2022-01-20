import * as React from "react";
import {
  useAuth
} from "../../context/user";

export function Page404(){
  const auth = useAuth();
  console.log(auth);
  return (
    <div>
      {auth.user && <h1>{auth.user.name}</h1>}
      <h1>404</h1>
      <h1>Missing Page</h1>
    </div>
  )
}
