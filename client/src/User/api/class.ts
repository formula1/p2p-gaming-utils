
import {
  UserSubmit
} from "../types";

import {
  fetchServer
} from "../../API/api"

type HasAuthHeader = {
  headers: {
    Authorization: string
  }
}

type AuthListener = (authToken: void | string)=>any

class Authorization {
  listeners: Array<AuthListener> = []
  authToken: void | string

  getAuthToken(){
    return this.authToken
  }

  addListener(listener: AuthListener){
    this.listeners.push(listener);
    return ()=>{
      this.listeners = this.listeners.filter((fn)=>{
        return fn !== listener
      })
    }
  }
  updateAuthtoken(newToken: void | string){
    this.authToken = newToken;
    this.listeners.forEach((l)=>{
      l(this.authToken)
    })
  }

  addAuthHeader(obj: void | object): void | object | HasAuthHeader {
    if(!this.authToken) {
      return obj;
    }
    if(!obj) {
      return {
        headers: {
          'Authorization': 'Bearer ' + this.authToken,
        }
      };
    }
    if(!(obj as any).headers){
      return {
        ...obj,
        headers: {
          'Authorization': 'Bearer ' + this.authToken,
        }
      }
    }
    if((obj as any).headers["Authorization"]){
      throw new Error("already have an authorization header");
    }
    return {
      ...obj,
      headers: {
        ...(obj as any).headers,
        'Authorization': 'Bearer ' + this.authToken,
      }
    }
  }
  logout(){
    this.updateAuthtoken(void 0)
  }
  handleUserSubmit(values: UserSubmit): Promise<string>{
    var data = new FormData();
    data.append("email", values.email);
    data.append("password", values.password);
    if(values.register){
      data.append("username", values.username);
      console.log("Register")
    }else{
      console.log("Login")
    }

    return (
      values.register ? (
        fetchServer("/auth/register", {
          method: "POST",
          body: data
        })
      ) : (
        fetchServer("/auth/login", {
          method: "POST",
          body: data
        })
      )
    ).then((token)=>{
      console.log("token:", token)
      this.updateAuthtoken(token.token)
      return token
    }, (err)=>{
      console.error(err);
    })
  }
  authorizedFetch(path: string, config?: RequestInit){
    if(!this.authToken){
      return Promise.reject(new Error("user is not logged in"));
    }
    console.log(config);
    const authConfig = this.addAuthHeader(config)

    console.log(authConfig);
    return fetchServer(path, authConfig as RequestInit);
  }
}

export {
  Authorization
}
