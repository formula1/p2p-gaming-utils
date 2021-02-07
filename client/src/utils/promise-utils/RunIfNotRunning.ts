

class RunIfNotRunning {
  isRunning:boolean = false;
  run(fn: ()=>any){
    if(this.isRunning) return Promise.reject("already running");
    this.isRunning = true;
    return Promise.resolve().then(()=>{
      return fn()
    }).then((value)=>{
      this.isRunning = false;
      return value
    }, (error)=>{
      this.isRunning = false;
      throw error
    })
  }
}

export {
  RunIfNotRunning
}
