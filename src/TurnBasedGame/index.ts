/*

Turnbased
  - each turn one or more people need to do an action
    - The people listening
  - Each player encrypts their move and sends to everyone else
    - each person who receives the move, responds with an accept
  - When all people have sent their move
    - Each person sends their decryption key


*/

type MoveListener = (move: string)=>void

interface Player {
  id: string;
  sendMove(move: string): Promise<boolean>;
  onRecieveMove(listener: MoveListener)
}

type PlayerTurn = {
  id: string
  encryptedMove: string,
  decryptionKey: string | void
}

class Turn {
  selfId: string;
  allPlayers: {
    [id: string]: Player
  }
  expectingPlayers: Array<string>;
  expectingPlayersValues: {
    [id: string]: PlayerTurn
  } = {}

  constructor(
    allPlayers: Array<Player>,
    expectingPlayers: Array<string>
  ){
    this.expectingPlayers = expectingPlayers;
    this.allPlayers = allPlayers.reduce((players, player)=>{
      players[player.id] = player;
      return players;
    }, {})
  }



  sendMove(move: string){
    return Promise.resolve().then(()=>{
      if(!this.expectingPlayers.some((id)=>{
        return id === this.selfId
      })){
        throw new Error("")
      }

      Promise.resolveObject.values(this.allPlayers).
    })
  }
  broadcastMoveToPlayers(move: string, players: Array<Player>){
    var playersWith Error: Array<Player> = []
    return Promise.all(players.map((player)=>{
      return player.sendMove(move).catch((error)=>{
        console.error(error);
        playersWithError.push(player)
      })
    })).then(()=>{
      if(playersWithError.length > 0){
        return this.broadcastMoveToPlayers(
          move, playersWithError
        )
      }
    })
  }

  sendEncryptionKey(){

  }



}
