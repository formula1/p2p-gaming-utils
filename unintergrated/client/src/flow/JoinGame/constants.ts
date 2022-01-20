
import {
  UpgradeFns
} from "../../util/indexeddb";

const DB_NAME = "WebTorrentLocal";
const DB_VERSION = 1;
const STORE_NAME = "TODO"

const dbUpgrades: UpgradeFns = {
  0: (db: IDBDatabase)=>{
    db.createObjectStore(STORE_NAME, { keyPath: "_id" });
  }
};
import {
  IndexedDBArgs,
} from "../../util/indexeddb";

const getDbArgs: IndexedDBArgs = {
  name: DB_NAME,
  version: DB_VERSION,
  upgradeFns: dbUpgrades
};


export {
  STORE_NAME,
  getDbArgs
};
