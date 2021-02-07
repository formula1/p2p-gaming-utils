import React, { FunctionComponent } from "react"

import {
  Link
} from "react-router-dom";

import {
  User as UserType
} from "../User/types"

function Menu(){
  return (
    <ul>
      <li>
        <Link to="/">Home</Link>
      </li>
      <li>
        <Link to="/lobby">Game Lobbies</Link>
      </li>
      <li>
        <Link to="/lobby/create">Create Lobby</Link>
      </li>
    </ul>
  );
}


const App: FunctionComponent<{ user: UserType }> = ({ user, children }) =>{
  return (
    <div>
      <h1>Hello {user.name}</h1>
      <Menu />
      <hr />
      {children}
      <hr />
      <div>
        This is the footer
      </div>
    </div>
  );
}
export default App;
