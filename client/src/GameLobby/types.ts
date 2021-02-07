
enum TypeOfGame {
  "TurnBased" = "TurnBased",
  "SameTurn" = "SameTurn",
  "LockStep" = "LockStep",
  "RollBack" = "RollBack"
}

const TypeOfGameValues: Array<TypeOfGame> = [
  TypeOfGame.TurnBased,
  TypeOfGame.SameTurn,
  TypeOfGame.LockStep,
  TypeOfGame.RollBack
]

type EditableGameLobbyType = {
  name: string;
  minUsers: number,
  maxUsers: number;
  typeOfGame: TypeOfGame
}

type UneditableGameLobbyType = {
  _id: string,
  creator: string;
  created: Date;
  users: Array<string>
  started: boolean
}

type GameLobbyType = EditableGameLobbyType & UneditableGameLobbyType;


export {
  EditableGameLobbyType,
  UneditableGameLobbyType,
  TypeOfGame,
  TypeOfGameValues,
  GameLobbyType
}
