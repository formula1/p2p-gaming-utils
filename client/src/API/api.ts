import {
  PUBLIC_SERVER_ORIGIN,
  PUBLIC_LIVE_ORIGIN,
  PUBLIC_ETH_NODE_ORIGIN
} from "./constants";

function handleFetchResponse(res: Response){
  console.log("handle response");
  return res.text().then((json)=>{
    console.log("return:", json)
    if(res.ok){
      return JSON.parse(json)
    }else{
      throw json
    }
  }, (err: any)=>{
    console.error(err);
    throw new Error(err)
  })
}

function fetchServer(path: string, config?: RequestInit){
  console.log(path, config);

  path = `${PUBLIC_SERVER_ORIGIN}${path||"/"}`;

  return fetch(
    path,
    config
  ).then(handleFetchResponse)
  .catch((e)=>{
    console.error(path, ":", e);
    throw e;
  })
}

function fetchLive(path: string, config?: RequestInit){
  path = `${PUBLIC_LIVE_ORIGIN}${path||"/"}`;
  return fetch(
    path,
    config
  ).then(handleFetchResponse)
  .catch((e)=>{
    console.error(path, ":", e);
    throw e;
  })

}

function fetchEth(path: string, config?: RequestInit){
  path = `${PUBLIC_ETH_NODE_ORIGIN}${path||"/"}`;
  return fetch(
    path,
    config
  ).then(handleFetchResponse)
  .catch((e)=>{
    console.error(path, ":", e);
    throw e;
  })

}


export {
  fetchServer,
  fetchLive,
  fetchEth
}
