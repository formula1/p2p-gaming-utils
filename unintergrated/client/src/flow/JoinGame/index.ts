import { Instance, Torrent } from "webtorrent";
import * as WebTorrent from "webtorrent";

import {
  CreateGameArgs
} from "../../../../types/src/PreGame/types"

import {
  getDbArgs,
  STORE_NAME
} from "./constants";

import {
  getDatabase,
  IndexedDBArgs,
} from "../../util/indexeddb";


var client = new WebTorrent();

class JoinGameStores {
  wtClient: Instance = new WebTorrent();

  public getWebTorrent(){
    return Promise.resolve(this.wtClient);
  }

  public getIndexedDB(){
    return getDatabase(getDbArgs);
  }

}

type Game = {
  _id: string,
  torrent: Buffer
}

class JoinGame {
  gs = new JoinGameStores();
  gameId: string;

  download(gameArgs: CreateGameArgs): Promise<Torrent>{
    return this.gs.getWebTorrent().then((client)=>{
      const game = client.get(gameArgs.gameHash)
      if(game && game !== null){
        return game
      }
      return addTorrent(gameArgs.magnetUri)
    })
  }

  connectToHost(){

  }
}
function joinGame(id: string){

}

function addTorrent(torrentValue): Promise<Torrent>{
  return new Promise((res, rej)=>{
    client.add(torrentValue, (torrent)=>{
      const rL = ()=>{
        torrent.removeListener("error", eL);
        res(torrent)
      }
      const eL = (error)=>{
        torrent.removeListener("done", rL);
        rej(error)
      }
      torrent.once('done', rL)
      torrent.once('error', eL)
    })
  });
}

function retrieveByID(db: IDBDatabase, storeName: string, id: string){
  return new Promise((res, rej)=>{
    var transaction = db.transaction([storeName], "readwrite");
    var objectStore = transaction.objectStore(storeName);
    var request = objectStore.get(id);
    request.onerror = rej;
    request.onsuccess = (ev)=>{
      console.log(ev)
      res((ev.target as any).result);
    };
  });
}

function storeByID(db: IDBDatabase, storeName: string, torrent: Torrent){
  return new Promise((res, rej)=>{
    var transaction = db.transaction([storeName], "readwrite");
    var objectStore = transaction.objectStore(storeName);
    var request = objectStore.add({ _id: torrent.infoHash, torrent: torrent.torrentFile});
    request.onerror = rej;
    request.onsuccess = (ev)=>{
      console.log(ev)
      res((ev.target as any).result);
    };
  });
}
