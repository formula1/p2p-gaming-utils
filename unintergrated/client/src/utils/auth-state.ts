import { useState, useEffect } from "react"
import * as qs from "qs";
import {
  fetchServer,
  getWebsocketURL
} from "./server-fetch"
import {
  User
} from "../types/User"

type JSONUserValue = {
  token: string,
  expirationDate: number,
  user: User
}

export interface IAuthState {
  user: void | User,
  getToken: ()=>string,
  storeUser: (shouldSave: boolean)=>void
  isStoring: boolean,
  logout: ()=>void,
  login: (props: { email: string, password: string })=>Promise<void>,
  register: (
    props: {
      username: string, email: string, password: string
    }
  )=>Promise<void>,
  fetch: (url: string, props?: RequestInit) => Promise<Response>,
  createWebsocket: (path: string, query: {[key: string]: string} | string)=> WebSocket
}

export function authState(): IAuthState{

  var userStorageString = localStorage.getItem("saved-user");
  var userStorageJson: void | JSONUserValue;
  if(userStorageString){
    userStorageJson = JSON.parse(userStorageString);
    if(Date.now() > (userStorageJson as JSONUserValue).expirationDate){
      userStorageJson = void 0;
      console.error("can't refresh token, must login again")
    }
  }

  useEffect(() => {
    if(userStorageJson && userStorageJson.expirationDate){
      handleTimeout(userStorageJson.expirationDate);
    }
  }, []);

  const [saveToken, setSaveToken] = useState(userStorageString ? true : false);
  const [jsonUser, setJSONUser] = useState(userStorageJson ? userStorageJson : void 0);
  const [refreshTimeout, setRefreshTimeout] = useState(void 0)

  useEffect(()=>{
    if(!saveToken){
      return localStorage.removeItem("saved-user")
    }
    if(!jsonUser){
      return localStorage.removeItem("saved-user")
    }
    localStorage.setItem("saved-user", JSON.stringify(jsonUser))
  }, [jsonUser, saveToken])

  function storeUser(shouldSave: boolean){
    setSaveToken(shouldSave)
  }

  function handleResponse(response: Response){
    return response.json().then((json)=>{
      if(!response.ok){
        console.error(json);
        throw json
      }
      console.log(json);
      setJSONUser({
        user: json.user,
        expirationDate: json.expirationDate,
        token: json.token
      });;

      console.log("save token:", saveToken, json)
      handleTimeout(json.expirationDate);
    })
  }

  function handleTimeout(expirationDate: number){
    var offset = expirationDate - Date.now() - 1000 * 60 * 5;
    Promise.resolve().then(()=>{
      clearTimeout(refreshTimeout);
      setRefreshTimeout(
        setTimeout(()=>{
          refreshToken();
        }, offset)
      )
    })
  }

  function refreshToken(){
    return fetch("/auth/refresh").then((response)=>{
      return response.json().then((json)=>{
        if(!response.ok){
          console.error(json);
          throw json
        }
        console.log(json);
        return this.handleResponseJSON(json)
      })
    })
  }

  function logout(){
    clearTimeout(this.refreshTimeout)
    setJSONUser(void 0);
  }

  function register(
    {
      username, email, password
    } : {
      username: string, email: string, password: string
    }
  ){
    return fetchServer(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({
          username, email, password
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      }
    ).then(handleResponse)
  }

  function login(
    {
      email, password
    } : {
      email: string, password: string
    }
  ){
    return fetchServer(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({
          email, password
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      }

    ).then(handleResponse)
  }

  function fetch(url: string, props?: RequestInit): Promise<Response> {
    return Promise.resolve().then(()=>{
      if(!props){
        props = {};
      }
      if(typeof props.headers !== "object"){
        props.headers = {};
      } else if(props.headers instanceof Headers){
        var oldHeaders = props.headers as Headers;
        var newHeaders = {} as any;
        for (var pair of (oldHeaders as any).entries()) {
          console.log(pair[0]+ ': '+ pair[1]);
          newHeaders[pair[0]] = pair[1];
        }
        props.headers = newHeaders;
      }

      if(!(props.headers as any)["Authorization"]){
        var bearer = 'Bearer ' + jsonUser.token;
        (props.headers as any)["Authorization"] = bearer;
      }

      console.log(props);

      return fetchServer(url, props)
    })
  }

  function createWebsocket(path: string, query: {[key: string]: string} | string){
    var queryString: string = typeof query === "string" ? ( query ) : qs.stringify(query);
    var wsUrl = getWebsocketURL(jsonUser.token, path, queryString);
    var ws = new WebSocket(wsUrl);
    return ws;
  }

  console.log("jsonUser:", jsonUser);

  return {
    user: jsonUser?.user,
    getToken: ()=>(jsonUser.token),
    storeUser,
    isStoring: saveToken,
    logout,
    login,
    register,
    fetch,
    createWebsocket
  }
}
