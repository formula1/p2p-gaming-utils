import {
  PUBLIC_SERVER_ORIGIN,
  PUBLIC_LIVE_ORIGIN,
  PUBLIC_ETH_NODE_ORIGIN
} from "./constants";

function fetchServer(path: string, config?: any){
  return fetch(
    `${PUBLIC_SERVER_ORIGIN}${path||"/"}`,
    config
  )
}

function fetchLive(path: string, config?: any){
  return fetch(
    `${PUBLIC_LIVE_ORIGIN}${path||"/"}`,
    config
  )
}

function fetchEth(path: string, config?: any){
  return fetch(
    `${PUBLIC_ETH_NODE_ORIGIN}${path||"/"}`,
    config
  )

}


export {
  fetchServer,
  fetchLive,
  fetchEth
}
