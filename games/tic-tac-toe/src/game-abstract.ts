import MessageDuplex from "common-messenger-interface";

type Player = {
  id: string,
  duplex: MessageDuplex
}

class GameAbstract {
  selfId: string
  players: Array<Player>

  constructor(selfId: string, players: Array<Player>){
    this.selfId = selfId;
    this.players = players;
  }
}


export {
  Player, GameAbstract
}
