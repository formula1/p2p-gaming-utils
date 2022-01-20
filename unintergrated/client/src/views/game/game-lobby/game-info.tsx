import React from "react";
import {
  GameLobby
} from "../../../types/GameLobby"

type GameInfoProps = {
  game: GameLobby;
  websocket: WebSocket;
}

export function GameInfo({ game }: GameInfoProps){
  return (
    <div>
      <h2>Game Info</h2>
      <div />
    </div>
  );
}
