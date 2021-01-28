import * as React from "react"
import * as ReactDOM from "react-dom";
import { fetchServer } from "./API/fetch";
import {
  PUBLIC_SERVER_ORIGIN
} from "./API/constants"
import * as API from "./API/constants";
import {
  UserLogin
} from "./User/ui"
console.log("before load")
console.log("API:", API);

console.log((window as any).web3);

function initRun(selector: string){

  ReactDOM.render(
    (
      <UserLogin>
        <div>
          <h2>Login</h2>
          <ul>
            <li><a href={PUBLIC_SERVER_ORIGIN + "/auth/passport-github"}><img src="/images/Octocat.png" /></a></li>
          </ul>
        </div>
      </UserLogin>
    ),
    document.querySelector(selector)
  );

}

export {initRun};
