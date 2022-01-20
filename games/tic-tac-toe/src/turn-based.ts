import {
  GameAbstract,
  Player
} from "./game-abstract"

import * as CryptoJS from "crypto-js"

const SEND_ENCRYPTED_MOVE = "send-encrypted-move";
const SEND_SECRET_KEY = "send-secret-key";

/*


Initial
- Connect to all players

- have a round win count

onEachRound
- each person sends their encrypted move
  - When a player recieves encrypted moves and sends their ecnrypted move
    - send their decryption key
      - When recieve each decryption key and sends decryption key
        - count which of the rock paper scissors is the most
          - The one with the most gets +1 to round count
          - The one that loses to the most gets -1 to round count
          - The one that beats the one doesn't change
        - If there is a tie with the most
          - The one that beats the other is considered the most

- Round

*/

abstract class SameTurnGameAbstract extends GameAbstract {

  isReady: boolean = false;

  playersEncryptedActions: {
    [id: string]: string
  } = {}

  playersSecretKey: {
    [id: string]: string
  } = {}

  constructor(selfId: string, players: Array<Player>){
    super(selfId, players);
    this.players.forEach((player)=>{
      if(player.id === this.selfId) return;
      player.duplex.onRequest(SEND_ENCRYPTED_MOVE, (value: string)=>{
        this.onRecieveMove(player.id, value);
        return true;
      });
      player.duplex.onRequest(SEND_SECRET_KEY, (value: string)=>{
        this.onRecieveMove(player.id, value);
        return true;
      });
    })
  }

  encryptValue(move: object) {
    //stringify move
    const moveString = JSON.stringify(move);
    // create secretKey
    const secretKey = Date.now().toString() + Math.random().toString(32).substring(2)
    // ecnrypt value
    const encryptedText = CryptoJS.AES.encrypt(moveString, secretKey).toString();

    return {
      encryptedText: encryptedText,
      secretKey: secretKey
    }
  }

  decryptValue({encryptedText, secretKey}: { encryptedText: string, secretKey: string}){
    // decryptValue
    var bytes  = CryptoJS.AES.decrypt(
      encryptedText,
      secretKey
    );
    // convert bytes to string
    var originalText = bytes.toString(CryptoJS.enc.Utf8);
    // parse string
    var move = JSON.parse(originalText);

    return move
  }

  broadcastMove(move: object){
    if(this.playersEncryptedActions[this.selfId]){
      throw new Error("Already sent own move")
    }
    const {
      encryptedText,
      secretKey
    } = this.encryptValue(move);

    this.playersEncryptedActions[this.selfId] = encryptedText;
    this.playersSecretKey[this.selfId] = secretKey;

    return Promise.all(this.players.map((player)=>{
      if(player.id === this.selfId){
        return true;
      }
      return player.duplex.request(
        SEND_ENCRYPTED_MOVE,
        this.playersEncryptedActions[this.selfId]
      ).then((value)=>{
        if(value === true){
          return true;
        }
        return {
          error: true,
          value: player.id + " did not send back expected value: " + JSON.stringify(value)
        }
      })
    })).then((values)=>{
      if(values.some((value)=>{
        value != true
      })){
        console.error(values)
      }else{
        this.tryToBroadcastSecretKey();
      }
    })
  }

  tryToBroadcastSecretKey(){
    if(this.players.length !== Object.keys(this.playersEncryptedActions).length){
      return
    }
    return Promise.all(this.players.map((player)=>{
      return player.duplex.request(
        SEND_SECRET_KEY,
        this.playersSecretKey[this.selfId]
      ).then((value)=>{
        if(value === true){
          return true;
        }
        return {
          error: true,
          value: player.id + " did not send back expected value: " + JSON.stringify(value)
        }
      })
    })).then((values)=>{
      if(values.some((value)=>{
        value != true
      })){
        console.error(values)
      }else{
        this.tryToHandleValues()
      }
    })
  }

  onRecieveMove(id: string, encryptedMove: string){
    if(this.playersEncryptedActions[id]){
      throw new Error("Already recieved move for player: " + id)
    }
    this.playersEncryptedActions[id] = encryptedMove
    this.tryToBroadcastSecretKey();
  }

  onRecieveSecretKey(id: string, secretKey: string){
    if(this.playersSecretKey[id]){
      throw new Error("Alreadt recieved secret key for player: " + id);
    }
    this.playersSecretKey[id] = secretKey;
    this.tryToHandleValues()
  }

  decryptValues(){
    var playerMoves = this.players.map((player)=>{
      var obj = this.decryptValue(
        {
          encryptedText: this.playersEncryptedActions[player.id],
          secretKey: this.playersSecretKey[player.id]
        }
      )

      return {
        move: obj,
        player: player.id
      }
    });

    return playerMoves
  }

  reset(){
    this.playersSecretKey = {};
    this.playersEncryptedActions = {};
  }

  tryToHandleValues(){
    if(this.players.length !== Object.keys(this.playersSecretKey).length){
      return;
    }
    this.handleValues(this.decryptValues());
  }
  abstract handleValues(values: Array<{player: string, move: object}>): any
}

export {SameTurnGameAbstract};
