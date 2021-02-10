import * as React from "react";

import {
  getUser,
  getStrategies
} from "../api";

import {
  UserContext
} from "../context";

function UserLogin(props: React.Props<{}>){
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
    getStrategies.run().then((strategies: Array<string>)=>{
      console.log("strategies:", strategies);
      setStrategies(strategies)
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

};
