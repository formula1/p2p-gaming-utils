import React, { Props } from "react";

import {
  PUBLIC_SERVER_ORIGIN,
  PUBLIC_UI_ORIGIN
} from "../../API/constants"

import {
  LoginStrategy
} from  "../types"

function LoginList(props: { strategies: Array<LoginStrategy>}){
  return (
    <div>
      <h2>Login</h2>
      <ul>{
        props.strategies.map((strategy)=>{
          return (
            <li key={strategy.name}>
              <a href={PUBLIC_SERVER_ORIGIN + strategy.url}>
                <img src={`${PUBLIC_UI_ORIGIN}/images/${strategy.requireName}.png`} />
              </a>
            </li>
          );
        })
      }
      </ul>
    </div>
  )
}

export {
  LoginList

};
