import * as React from "react";
import {
  useAuth
} from "../../context/user";

export function Home(){
  const auth = useAuth();

  return (
    <div>
      {auth.user && <h1>{auth.user.name}</h1>}
      <h1>Hello World</h1>
    </div>
  )
}
