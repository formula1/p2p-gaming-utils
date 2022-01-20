
join websocket after login

when in lobby
- emit "join lobby"
when leave lobby
- emit "leave lobby"

List Lobbies
  - join "lobby" room

Join a lobby
  - leave "lobby" room
  - join "lobby/:id" room
  - request

Leave a lobby
  - remove from "lobby/:id" room
  - update room "lobby/:id"

cancel a lobby
- remove lobby
- trigger list to update lobbies
- remove lobby


start a lobby
- create a game
- trigger list to update lobbies
