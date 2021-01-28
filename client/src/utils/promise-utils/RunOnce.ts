
type ResolveReject = [(value: any)=>any, (error: any)=>any]
type FunctionToRun = ()=>any;

class RunOnce {
  isRunning: boolean = false;
  isFinished: boolean = false;
  value: any
  isError: boolean = false;
  functionToRun: FunctionToRun;
  listeners: Array<ResolveReject> = []

  constructor(func: FunctionToRun){
    this.functionToRun = func
  }
  run(){
    return new Promise((res, rej)=>{
      if(this.isFinished){
        if(this.isError){
          return rej(this.value)
        }
        return res(this.value)
      }
      this.listeners.push([res, rej]);
      if(this.isRunning){
        return;
      }
      this.isRunning = true;
      Promise.resolve().then(()=>{
        return this.functionToRun();
      }).then((value)=>{
        this.isFinished = true;
        this.value = value;
        this.isError = false;
        this.listeners.forEach((resrej)=>{
          resrej[0](value)
        })
        this.listeners = [];
      }, (error)=>{
        this.isFinished = true;
        this.value = error;
        this.isError = true;
        this.listeners.forEach((resrej)=>{
          resrej[1](error)
        })
        this.listeners = [];
      })
    })
  }
}

export {
  RunOnce
}
