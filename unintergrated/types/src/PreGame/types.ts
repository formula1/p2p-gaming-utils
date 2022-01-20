enum CreatorOrDemocracy {
  Creator = "Creator",
  Democracy = "Democracy"
}

enum Host {
  Hosted = "Hosted",
  LockStep = "LockStep",
  RollBack = "RollBack"
}


type CreateGameArgs = {
  gameHash: string,
  magnetUri: string,
  hostType: Host,
  kickType: CreatorOrDemocracy,
  advertisement: string,
  maxPlayers: number,
}

type GameValue = {
  id: string,
  gameArgs: CreateGameArgs,
  hasBeenDownloaded: boolean,
  currentNumberOfPlayers: number
}


export {
  CreateGameArgs,
  GameValue
};
