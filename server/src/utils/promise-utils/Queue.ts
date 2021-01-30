
type runnableFn = ()=>any
type resolveFn = (value: any)=>any
type rejectFn = (error: any)=>any

class Queue {
  line: Array<[
    runnableFn, resolveFn, rejectFn
  ]> = [];
  running: boolean = false;
  run(fn: runnableFn){
    return new Promise((res: resolveFn, rej: rejectFn)=>{
      if(this.running){
        this.line.push([fn, res, rej]);
      }else{
        this.running = true
        this.runFn(fn, res, rej);
      }
    });
  }

  private runNext(){
    if(this.line.length){
      var fnArgs = this.line.shift();
      this.runFn(fnArgs[0], fnArgs[1], fnArgs[2])
    } else {
      this.running = false
    }
  }

  private runFn(
    fn: runnableFn, res: resolveFn, rej: rejectFn
  ){
    return Promise.resolve().then(()=>{
      return fn()
    }).then((v: any)=>{
      this.runNext()
      res(v)
    }, (e: any)=>{
      this.runNext()
      rej(e);
    })
  }
}

export {
  Queue
}
