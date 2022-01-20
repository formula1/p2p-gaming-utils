
type Listener<Output> = (output: Output)=>any

export class Observable<Output> {
  cbs: Array<Listener<Output>> = [];
  listen(l: Listener<Output>){
    this.cbs.push(l);
    return ()=>{
      this.cbs = this.cbs.filter((o)=>{
        return o !== l
      });
    }
  }
  emit(o: Output){
    this.cbs.forEach((l)=>{
      l(o)
    })
  }
}
