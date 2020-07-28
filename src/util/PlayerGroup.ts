
interface Player {
  id: string;
  sendAction(selfId: string, action: string, targetFrame: number): Promise<any>;
  listenToAction
}

class SelfPlayer {

}

class PlayerGroup {
  currentFrame: 0;
  maxSendTimeInFrames: number
  selfId: string;
  players: {
    [id: string]: Player
  }
  actions: {
    [frame: number]: {
      [playerId: string]: Array<string>,
    }
  }

  broadcastAction(action: string){
    const selfId = this.selfId;
    const targetFrame = this.currentFrame + this.maxSendTimeInFrames;

    return Promise.all(
      Object.values(this.players).map((player)=>{
        player.sendAction(selfId, action, targetFrame)
      })
    )
  }

  onRecieveAction(playerId: string, action: string, targetFrame: number){
    if(targetFrame <= this.currentFrame){
      throw new Error("target frame for action is after or equal to current frame")
    }
    if(!this.actions[targetFrame]){
      this.actions[targetFrame] = {};
    }
    var frameActions = this.actions[targetFrame]
    if(!frameActions[playerId]){
      frameActions[playerId] = [];
    }
    frameActions[playerId].push(action);

  }


  get

}
