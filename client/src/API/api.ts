import {
  PUBLIC_SERVER_ORIGIN,
  PUBLIC_LIVE_ORIGIN,
  PUBLIC_ETH_NODE_ORIGIN
} from "./constants";

function handleFetchResponse(res: Response){

  console.log("handle response");
  if(res.ok){
    return res.json()
  }else{
    return res.text().then((err)=>{
      throw new Error(err)
    })
  }
}

function fetchServer(path: string, config?: any){
  console.log(path, config);

  return fetch(
    `${PUBLIC_SERVER_ORIGIN}${path||"/"}`,
    config
  ).then(handleFetchResponse, (e)=>{
    console.error(e);
  })
}

function fetchLive(path: string, config?: any){
  return fetch(
    `${PUBLIC_LIVE_ORIGIN}${path||"/"}`,
    config
  ).then(handleFetchResponse)
}

function fetchEth(path: string, config?: any){
  return fetch(
    `${PUBLIC_ETH_NODE_ORIGIN}${path||"/"}`,
    config
  ).then(handleFetchResponse)
}


export {
  fetchServer,
  fetchLive,
  fetchEth
}
