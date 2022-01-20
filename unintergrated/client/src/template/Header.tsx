import * as React from "react";

import {
  Link,
  useNavigate
} from "react-router-dom";

import {
  useAuth
} from "../context/user";


export function Header(){
  let auth = useAuth();
  let navigate = useNavigate();

  return (
    <div className="header">
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          {!auth.user && <li>
            <Link to="/login">Login</Link>
          </li>}
          {
            auth.user && [
              <li key="game-loggy-list">
                <Link to="/game-lobby">Games List</Link>
              </li>,
              <li key="game-loggy-create">
                <Link to="/game-lobby/create">Create Game</Link>
              </li>,
              <li key="save-user">
                <a
                  href="#"
                  onClick={(e)=>{
                    e.preventDefault();
                    auth.storeUser(!auth.isStoring);
                  }}
                >Save User? {auth.isStoring ? "No": "Yes"}</a>
              </li>,
              <li key="logoue">
                <a
                  href="#"
                  onClick={(e)=>{
                    e.preventDefault();
                    auth.logout();
                    navigate("/");
                  }}
                >Logout</a>
              </li>
            ]
          }
        </ul>
      </nav>
    </div>
  )
}
