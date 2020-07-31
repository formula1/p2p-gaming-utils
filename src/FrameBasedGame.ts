
import {MersenneTwister} from "./util/MersenneTwister";
import {Clock} from "./util/Clock";
type Action = {
  name: string,
  value: number
}

type Actions = {
  [name: string]: Action
}

export abstract class Game {
  clock: Clock;
  frame: number = 0
  random: MersenneTwister;
  actions: {
    [frame: number]: {
      [playerId: string]: Array<Action>,
    }
  }

  constructor(randomSeed: number, framesPerSecond: number){
    this.random = new MersenneTwister(randomSeed);
    this.clock = new Clock(framesPerSecond)

  }

  doFrame(){
    requestAnimationFrame(()=>{
      this.doFrame()
    })
    if(!this.clock.checkTime()){
      return;
    }

    const frameNumber: number = this.frame;
    var actions = this.actions[frameNumber];
    if(!actions){
      return;
    }
    delete this.actions[frameNumber];
    Object.keys(actions).forEach((playerId)=>{

    })
    this.logic();
    this.render(this.clock.msPerFrame);
    this.frame++;
  }

  sendAction(a: Action){

  }

  storeAction(playerId: string, a: Action, targetFrame: number){
    if(this.frame >= targetFrame){
      throw new Error("frame for action is after desired frame");
    }
    if(!this.actions[targetFrame]){
      this.actions[targetFrame] = {};
    }
    var frameActions = this.actions[targetFrame]
    if(!frameActions[playerId]){
      frameActions[playerId] = [];
    }
    frameActions[playerId].push(a);

  }

  abstract render(delta: number): any;
  abstract logic(): any;
}
