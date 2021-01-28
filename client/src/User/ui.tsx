import React, { Props } from "react";

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
  UserLogin
};
