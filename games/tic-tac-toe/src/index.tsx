import {Component} from "react";

import {
  SameTurnGameAbstract
} from "./same-turn"

import {EventEmitter} from "@billjs/event-emitter"

enum POSSIBLE_ACTIONS_TYPE {
  ROCK = "ROCK",
  PAPER = "PAPER",
  SCISSORS = "SCISSORS",
}

const POSSIBLE_ACTIONS_VALUES: Array<POSSIBLE_ACTIONS_TYPE> = [
  POSSIBLE_ACTIONS_TYPE.ROCK,
  POSSIBLE_ACTIONS_TYPE.PAPER,
  POSSIBLE_ACTIONS_TYPE.SCISSORS,
]

type MoveObject = {
  move: POSSIBLE_ACTIONS_TYPE
};

type ActionsReduce = {
  [POSSIBLE_ACTIONS_TYPE.ROCK]: Array<string>,
  [POSSIBLE_ACTIONS_TYPE.PAPER]: Array<string>,
  [POSSIBLE_ACTIONS_TYPE.SCISSORS]: Array<string>
};

class RockPaperScissors extends SameTurnGameAbstract {
  events = new EventEmitter()


  roundWinCount: {
    [id: string]: number
  } = {}

  winningKey: POSSIBLE_ACTIONS_TYPE | void
  tiedKeys: boolean
  losingKey: POSSIBLE_ACTIONS_TYPE | void

  roundValues: ActionsReduce;

  constructor(){

  }

  doAction(action: POSSIBLE_ACTIONS_TYPE){
    this.broadcastMove({
      move: action
    });
  }

  handleValues(values: Array<{player: string, move: MoveObject}>){
    var roundValues = values.reduce((obj: ActionsReduce, playerMove: {player: string, move: MoveObject})=>{
      const {
        player, move
      } = playerMove;

      if(
        !POSSIBLE_ACTIONS_VALUES.some((possibleAction)=>{
        return possibleAction === move.move
        })
      ){
        throw new Error(
          `player: ${player}, doesn't have an appropriate action. instead recieved: ${JSON.stringify(move)}`
          );
      }
      obj[move.move] = obj[move.move].concat([player])
      return obj
    }, {
      [POSSIBLE_ACTIONS_TYPE.ROCK]: [],
      [POSSIBLE_ACTIONS_TYPE.PAPER]: [],
      [POSSIBLE_ACTIONS_TYPE.SCISSORS]: []
    } as ActionsReduce)

    this.roundValues = roundValues

    var winningKeys = Object.keys(roundValues).reduce(
      (currentKeys: Array<POSSIBLE_ACTIONS_TYPE>, key: POSSIBLE_ACTIONS_TYPE)=>{
        if(currentKeys.length === 0){
          return [key];
        }
        if(roundValues[currentKeys[0]].length === roundValues[key].length){
          return currentKeys.concat([key])
        }
        if(roundValues[currentKeys[0]].length < roundValues[key].length){
          return [key]
        }
        return currentKeys;
      }, []
    )

    switch(winningKeys.length){
      case 3: {
        this.tiedKeys = true;
        this.winningKey = void 0;
        this.losingKey = void 0;
        break;
      }
      case 2: {
        this.tiedKeys = false;
        var sortedKeys = winningKeys.sort();
        if(sortedKeys[0] === POSSIBLE_ACTIONS_TYPE.PAPER){
          if(sortedKeys[1] === POSSIBLE_ACTIONS_TYPE.ROCK){
            this.winningKey = POSSIBLE_ACTIONS_TYPE.PAPER;
            this.losingKey = POSSIBLE_ACTIONS_TYPE.ROCK
          }else{
            this.losingKey = POSSIBLE_ACTIONS_TYPE.PAPER
            this.winningKey = POSSIBLE_ACTIONS_TYPE.SCISSORS
          }
        }else{
          // If its not paper then it has to be rock adn scissors
          this.winningKey = POSSIBLE_ACTIONS_TYPE.ROCK
          this.losingKey = POSSIBLE_ACTIONS_TYPE.SCISSORS
        }
        break;
      }

      case 1: {
        this.tiedKeys = false
        this.winningKey = winningKeys[0];
        switch(this.winningKey){
          case POSSIBLE_ACTIONS_TYPE.ROCK: {
            this.losingKey = POSSIBLE_ACTIONS_TYPE.SCISSORS
            break;
          }
          case POSSIBLE_ACTIONS_TYPE.PAPER: {
            this.losingKey = POSSIBLE_ACTIONS_TYPE.ROCK
            break;
          }
          case POSSIBLE_ACTIONS_TYPE.SCISSORS: {
            this.losingKey = POSSIBLE_ACTIONS_TYPE.PAPER
            break;
          }
        }
        break;
      }
    }

    POSSIBLE_ACTIONS_VALUES.forEach((type:POSSIBLE_ACTIONS_TYPE)=>{
      roundValues[type].forEach((playerId)=>{
        if(this.tiedKeys){
          this.roundWinCount[playerId] = this.roundWinCount[playerId] || 0;
        }else if(this.winningKey === type){
          this.roundWinCount[playerId] = (this.roundWinCount[playerId] || 0) + 1;
        }else if(this.losingKey === type){
          this.roundWinCount[playerId] = (this.roundWinCount[playerId] || 0) - 1;
        }
      })
    })

    this.events.fire("finish round")
  }

  reset(){
    super.reset()

  }
}
