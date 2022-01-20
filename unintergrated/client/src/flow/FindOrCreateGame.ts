
import {
  IFindOrCreateGame
} from "../../../types/src/PreGame/interface"

import fetch from "whatwg-fetch"

class FindOrCreateGame implements IFindOrCreateGame {
  constructor(
    private url: string
  ){
  }
  createGame(createGameArgs: ){
    fetch
  }

  deleteGame(){

  }

  loadGames(){

  }

  chooseGame(){

  }

}
