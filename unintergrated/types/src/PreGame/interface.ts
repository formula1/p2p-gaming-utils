
import {
  Observable,
} from "..//util/Observable"

import {
  CreateGameArgs,
  GameValue
} from "./types"

interface IFindOrCreateGame extends Observable<string> {
  createGame(createGameArgs: CreateGameArgs): Promise<string>
  deleteGame(id: string): Promise<boolean>

  loadGames(filter: string): Promise<Array<GameValue>>;
  chooseGame(id: string): Promise<string>

}

export {
  IFindOrCreateGame
};
