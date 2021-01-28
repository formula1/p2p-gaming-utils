import {
  RunOnce
} from "../utils/promise-utils";

import { fetchServer } from "../API/fetch";

const getUser = new RunOnce((): any=>{
  return fetchServer("/auth/self").then((response)=>{
    if(!response.ok){
      return response.text().then((text)=>{
        console.log("fail error")
        throw new Error(text);
      })
    }else{
      return response.json().then((json)=>{
        console.log("return json", json);
        return json;
      })
    }
  })

});

const getStrategies = new RunOnce((): any=>{
  return fetchServer("/auth/strategies").then((response)=>{
    if(!response.ok){
      return response.text().then((text)=>{
        throw new Error(text);
      })
    }else{
      return response.json()
    }
  })
});

export {
  getUser,
  getStrategies
}
