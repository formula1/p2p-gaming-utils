
import {
  getDatabase,
  IndexedDBArgs,
} from "../../util/indexeddb";

import {
  STORE_NAME,
} from "./constants";

export class IndexedDBTodoAPI implements ITodoAPI {
  private args: IndexedDBArgs
  private listeners: Array<Listener> = [];

  listen(listener: (value:any)=>any){
    this.listeners.push(listener);
    return ()=>{
      this.listeners.filter((l)=>{
        return l != listener
      })
    }
  }

  emit(value?: any){
    this.listeners.forEach((l)=>{
      l(value)
    })
  }
  constructor(args: IndexedDBArgs){
    this.listen(()=>{
      console.log("updating");
    })
    this.args = args;
  }

  private getDB(){
    return getDatabase(this.args);
  }

  public r_List(): Promise<any /*Array<Todo> */> {
    return this.getDB().then((db)=>{
      return new Promise((res, rej)=>{
        var transaction = db.transaction([TODO_OBJECT_STORE_NAME], "readwrite");
        var objectStore = transaction.objectStore(TODO_OBJECT_STORE_NAME);
        var request = objectStore.getAllKeys();
        request.onerror = rej;
        request.onsuccess = (ev)=>{
          console.log(ev)
          res((ev.target as any).result);
        };
      });
    });
  }
  public r_Single(id: string): Promise<any> {
    return this.getDB().then((db)=>{
      return new Promise((res, rej)=>{
        var transaction = db.transaction([TODO_OBJECT_STORE_NAME], "readwrite");
        var objectStore = transaction.objectStore(TODO_OBJECT_STORE_NAME);
        var request = objectStore.get(id);
        request.onerror = rej;
        request.onsuccess = (ev)=>{
          console.log(ev)
          res((ev.target as any).result);
        };
      });
    });
  }
  public r_All(): Promise<any /*Array<Todo> */> {
    return this.getDB().then((db)=>{
      return new Promise((res, rej)=>{
        var transaction = db.transaction([TODO_OBJECT_STORE_NAME], "readwrite");
        var objectStore = transaction.objectStore(TODO_OBJECT_STORE_NAME);
        var request = objectStore.getAll();
        request.onerror = rej;
        request.onsuccess = (ev)=>{
          console.log(ev)
          res((ev.target as any).result);
        };
      });
    });
  }


  public c_createItem(item: TodoInit): Promise<Todo>{
    return this.getDB().then((db)=>{
      return new Promise((res, rej)=>{
        (item as Todo)._id = uniqueID();
        var transaction = db.transaction([TODO_OBJECT_STORE_NAME], "readwrite");
        var objectStore = transaction.objectStore(TODO_OBJECT_STORE_NAME);
        var request = objectStore.add(item);
        request.onerror = rej;
        request.onsuccess = ()=>{
          res(item as Todo);
        };
      });
    }).then((v: Todo)=>{
      this.emit('update');
      return v
    });
  }
  public u_finishItem(id: string): Promise<Todo> {
    return this.getDB().then((db)=>{
      return new Promise((res, rej)=>{
        var transaction = db.transaction([TODO_OBJECT_STORE_NAME], "readwrite");
        var objectStore = transaction.objectStore(TODO_OBJECT_STORE_NAME);
        var request = objectStore.get(id);
        request.onerror = rej;
        request.onsuccess = (event)=>{
          res([objectStore, event]);
        };
      });
    }).then(([objectStore, event])=>{
      return new Promise((res, rej)=>{
        var data = event.target.result;
        data.finished = Date.now();
        var requestUpdate = objectStore.put(data);
         requestUpdate.onerror = rej;
         requestUpdate.onsuccess = ()=>{
           res(data)
         };
      });
    }).then((v: Todo)=>{
      this.emit('update');
      return v
    });
  }
  public d_deleteItem(id: string): Promise<Todo>{
    return this.getDB().then((db)=>{
      return new Promise((res, rej)=>{
        var objectStore = db.transaction([TODO_OBJECT_STORE_NAME], "readwrite")
        .objectStore(TODO_OBJECT_STORE_NAME);
        var request = objectStore.get(id);
        request.onerror = rej;
        request.onsuccess = (event)=>{
          res([objectStore, event]);
        };
      });
    }).then(([objectStore, event])=>{
      return new Promise((res, rej)=>{
        var data = event.target.result;
        var requestUpdate = objectStore.delete(id);
         requestUpdate.onerror = rej;
         requestUpdate.onsuccess = ()=>{
           res(data)
         };
      });
    }).then((v: Todo)=>{
      this.emit('update');
      return v
    });
  }
};
