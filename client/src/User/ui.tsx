import React, { Props } from "react";

import {
  PUBLIC_SERVER_ORIGIN,
  PUBLIC_UI_ORIGIN
} from "../API/constants"

function LoginList(){
  return (
    <div>
      <h2>Login</h2>
      <ul>
        <li><a href={PUBLIC_SERVER_ORIGIN + "/auth/passport-github"}>
          <img src={PUBLIC_UI_ORIGIN + "/images/Octocat.png"} />
        </a></li>
      </ul>
    </div>
  )
}

import {
  getUser,
  getStrategies
} from "./api";

import {
  UserContext
} from "./context";

function UserLogin(props: Props<{}>){
  console.log("USER LOGIN UI")

  const [user, setUser] = React.useState({});
  const [strategies, setStrategies] = React.useState([]);

  React.useEffect(() => {
    getUser.run().then((userValue: any)=>{
      console.log("user:", userValue)
      setUser(userValue)
    }, (error)=>{
      console.error(error)
      setUser(null);
    })
  }, []);
  React.useEffect(() => {
    getStrategies.run().then((strategies)=>{
      console.log("strategies:", strategies)
    })
  }, []);
  return (
    <UserContext.Provider value={{
      strategies: strategies,
      user: user
    }}>{
      props.children
    }</UserContext.Provider>
  );
}

export {
  UserLogin,
  LoginList

};
