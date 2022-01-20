import * as React from "react";
import { IAuthState, authState } from "../utils/auth-state";

import {
  Route,
  Navigate
} from "react-router-dom";


const authContext = React.createContext(void 0);
export { authContext };

export function ProvideAuth({ children }: { children: React.ReactNode}) {
  const auth = authState();
  return (
    <authContext.Provider value={auth}>
      {children}
    </authContext.Provider>
  );
}

export function useAuth(): IAuthState{
  return React.useContext(authContext);

}

export function PrivateRoute({ children, ...rest }: { children: React.ReactNode}) {
  const auth = useAuth();

  if(auth.user){
    return children
  }

  return (
    <Navigate
      to={"/login"}
      state={{ from: location }}
    />
  );

  // return (
  //   <Route
  //     {...rest}
  //     element={(props: any) =>{
  //       console.log(props);
  //       return (
  //         auth.user ? (
  //           children
  //         ) : (
  //         )
  //       )
  //     }}
  //   />
  // );
}
