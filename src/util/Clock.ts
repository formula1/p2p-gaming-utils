

export class Clock {
  msPerFrame: number;
  lastTime: number
  currentDelta: number;
  currentFrame: number = 0;
  constructor(framesPerSecond: number){
    this.msPerFrame = Math.floor(1/framesPerSecond * 1000)
    this.lastTime = Date.now()
  }
  checkTime(): boolean{
    var lastTime = this.lastTime
    var curTime = Date.now();
    var delta = curTime - lastTime;
    if(delta < this.msPerFrame){
      return false
    }
    this.currentDelta = delta;
    this.lastTime = curTime - (delta - this.msPerFrame);
    this.currentFrame++;
    return true;
  }
}
