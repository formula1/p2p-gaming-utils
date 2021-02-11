import React, {Component, Props, useState, useEffect} from "react";

import {
  User, LoginStrategy, UserSubmit
} from "../types";

import {
  Authorization,
  authHandler
} from "../api"

import {
  UserContext
} from "../context";

class UserLogin extends Component {
  state: {
    user: void | User,
    strategies: Array<LoginStrategy>
  } ={
    strategies: [],
    user: void 0
  }
  auth: Authorization = authHandler
  removeListener: void | (()=>any)
  componentDidMount(){
    this.removeListener = this.auth.addListener((token)=>{
      this.auth.authorizedFetch("/auth/self").then((user)=>{
        this.setState({
          user: user
        })
      })
    })
  }
  componentWillUnmount(){
    this.removeListener && this.removeListener()
  }
  render(){
    return (
      <UserContext.Provider
        value={{
          strategies: this.state.strategies,
          user: this.state.user,
          updateUser: (body: UserSubmit)=>{
            this.auth.handleUserSubmit(body)
          }
        }}
      >{
        this.props.children
      }</UserContext.Provider>
    )
  }
}

export {
  UserLogin,
};
