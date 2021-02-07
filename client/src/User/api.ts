import {
  RunOnce
} from "../utils/promise-utils";

import { fetchServer } from "../API/api";

const getUser = new RunOnce((): any=>{
  return fetchServer("/auth/self")
});

const getStrategies = new RunOnce((): any=>{
  return fetchServer("/auth/strategies")
});

export {
  getUser,
  getStrategies
}
