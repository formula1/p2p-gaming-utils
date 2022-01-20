

export function runUntilAllFinish<DataType>(
  runOnItem: (item: DataType)=>any, items: Array<DataType>
){
  var leftOver: Array<DataType> = [];
  return Promise.all(items.map((item)=>{
    return Promise.resolve().then(()=>{
      return runOnItem(item)
    }).catch((error)=>{
      console.error(error);
      leftOver.push(item)
    })
  })).then(()=>{
    if(leftOver.length > 0){
      return runUntilAllFinish(runOnItem, leftOver);
    }
  })
}
