
type FrameFunction = (frame: number)=>any;
type CallBackFunction = ()=>any;

export class Clock {
  msPerFrame: number;
  lastTime: number
  currentDelta: number;
  currentFrame: number = 0;

  deltaFunction: FrameFunction;
  alwaysRun: CallBackFunction | void;

  constructor(
    framesPerSecond: number,
    deltaFunction: FrameFunction,
    alwaysRun?: CallBackFunction
  ){
    this.msPerFrame = Math.floor(1* 1000/framesPerSecond)
    this.lastTime = Date.now()
    this.deltaFunction = deltaFunction;
    this.alwaysRun = alwaysRun
  }
  checkTime(): boolean{
    var lastTime = this.lastTime
    var curTime = Date.now();
    var delta = curTime - lastTime;
    if(this.alwaysRun){
      this.alwaysRun()
    }
    if(delta < this.msPerFrame){
      return false
    }
    this.currentDelta = delta;
    this.lastTime = curTime - (delta - this.msPerFrame);
    this.currentFrame++;
    this.deltaFunction(this.currentFrame);
    return true;
  }
}
