import {
  PUBLIC_WEBSOCKET_PROTOCOL,
  PUBLIC_SERVER_PROTOCOL,
  PUBLIC_SERVER_HOSTNAME,
  PUBLIC_SERVER_PORT,
} from "../constants/server"

export function getWebsocketURL(auth: string, path: string, queryString: string){
  return `${PUBLIC_WEBSOCKET_PROTOCOL}//${PUBLIC_SERVER_HOSTNAME}:${PUBLIC_SERVER_PORT}${path}?${queryString}`
}

export function setServerOrigin(url: string){
  var loc = document.createElement('a');
  loc.href = url;
  loc.protocol = PUBLIC_SERVER_PROTOCOL;
  loc.hostname = PUBLIC_SERVER_HOSTNAME;
  loc.port = PUBLIC_SERVER_PORT;

  return loc.href;
}

export function fetchServer(beforeUrl: string, options?: RequestInit): Promise<Response>{
  console.log("before url",beforeUrl);
  var afterUrl = setServerOrigin(beforeUrl);
  console.log("after url",afterUrl);
  return fetch(afterUrl, options);
}
