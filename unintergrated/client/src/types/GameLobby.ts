
export interface GameLobby {
  lobbyName: string;
  fileId: string;
  host: string;
  maxPlayers: number;
  joined: Array<string>,
  banned: Array<string>,
}
