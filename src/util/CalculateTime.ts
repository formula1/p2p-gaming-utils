

function calculateTimeDiff(otherUser){
  var initDate = Date.now();
  return otherUser.request("date").then(()=>{
    var afterDate = Date.now();
    var offset = (afterDate - initDate)/2;
    return offset;
  })
}

export {
  calculateTimeDiff
}
