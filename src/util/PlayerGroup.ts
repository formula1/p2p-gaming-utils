
type PlayerListener = (action: string, targetFrame: number)=>any

abstract class Player {
  id: string;
  listeners: Array<PlayerListener>
  abstract sendAction(selfId: string, action: string, targetFrame: number): Promise<any>;
  listenToAction(listener: PlayerListener): any {
    this.listeners.push(listener)
  }
  removeListeners(): void {
    this.listeners = [];
  }
}

class SelfPlayer {

}

class PlayerGroup {
  currentFrame: 0;
  maxSendTimeInFrames: number
  selfId: string;
  players: {
    [id: string]: Player
  } = {}
  actions: {
    [frame: number]: {
      [playerId: string]: Array<string>,
    }
  } = {};

  constructor(players: Array<Player>){
    players.map((player: Player)=>{
      this.players[player.id] = player;
      player.listenToAction
    })
  }

  removePlayer(playerId:string){
    var player = this.players[playerId];
    delete this.players[playerId];
    player.removeListeners()
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


  popActions(){
    var actions = this.actions[this.currentFrame];
    delete this.actions[this.currentFrame];
    this.currentFrame++;
    return actions || {};
  }

}
