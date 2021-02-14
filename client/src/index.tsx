import React from "react"
import * as ReactDOM from "react-dom";
import * as API from "./API/constants";

import {
  MainRouter
} from "./router";

import {
  UserLogin
} from "./User/ui"

console.log("before load")
console.log("API:", API);

console.log((window as any).web3);

function initRun(selector: string){

  ReactDOM.render(
    (
      <MainRouter />
    ),
    document.querySelector(selector)
  );

}

export {initRun};
