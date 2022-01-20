
declare global {
    interface Window {
      mozIndexedDB: IDBFactory
      webkitIndexedDB: IDBFactory
      msIndexedDB: IDBFactory
    }
}

const indexedDB = (
  window.indexedDB
  || window.mozIndexedDB as IDBFactory
  || window.webkitIndexedDB as IDBFactory
  || window.msIndexedDB as IDBFactory
)

enum INDEXED_DB_STATUS {
  INIT = "INIT",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR"
}

export {
  INDEXED_DB_STATUS,
  indexedDB,
};

import {
  JSONObject
} from "./JSON";

if (!indexedDB) {
    console.error("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
}

type IdJSONObject = JSONObject & { _id: string };
type IdJSONArray = Array<IdJSONObject>;

export {
  IdJSONObject,
  IdJSONArray
}

type IndexedDBArgs = {
  name: string,
  version: number,
  upgradeFns: UpgradeFns
};

type UpgradeFns = { [key: number ]: (db: IDBDatabase)=>any};

export {
  IndexedDBArgs,
  UpgradeFns
}

type upgradeDBArgs = {
  request: IDBOpenDBRequest,
  event: IDBVersionChangeEvent,
  upgradeFns: UpgradeFns
}

function upgradeDB(
  {
    request,
    event,
    upgradeFns
  }: upgradeDBArgs
){
  var db = request.result;
  let prevVersion = event.oldVersion;
  const curVersion = event.newVersion;
  while(prevVersion < curVersion){
    console.log(prevVersion, curVersion)
    upgradeFns[prevVersion](db);
    prevVersion++;
  }
}

export function getDatabase({
  name,
  version,
  upgradeFns
}: IndexedDBArgs): Promise<IDBDatabase>{
  return new Promise((res, rej)=>{
    var request = indexedDB.open(name, version);
    request.onerror = rej;
    request.onupgradeneeded = function(event: IDBVersionChangeEvent) {
      upgradeDB({ request, event, upgradeFns });
    };
    request.onsuccess = (e: any)=>{
      res(e.target.result);
    };
  });
}
