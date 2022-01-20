

export function waitorResolve(promise: Promise<any>){
  var running = true;
  var isError = false
  var waiting: Array<[(v:any)=>any, (err:any)=>any]> = [];
  var valueResult: any;

  promise.then(
    (value)=>{
      running = false;
      valueResult = value;
      waiting.forEach((resrej)=>{
        resrej[0](value);
      })
    }, (err)=>{
      running = false;
      valueResult = err;
      waiting.forEach((resrej)=>{
        resrej[1](err);
      })

      valueResult = err;
    }
  )

  return function(){
    return new Promise((res, rej)=>{
      if(running){
        return waiting.push([res, rej]);
      }
      if(isError){
        return rej(valueResult)
      } else {
        return res(valueResult)
      }
    })
  }

}
