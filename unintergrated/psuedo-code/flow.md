
Player Creates Game
- Game has
  - Watcher
    - A watcher can watch for game win/loss and/or leave
    - Is Leave Watcher
    - Is win/loss watcher
    - May require players need to be registered with the watcher
  - Kick Options
    - set by
      - Democracy
      - Creator
  - Sync Options
    - Hosted
    - Lock Step
    - Roll Back
  - Start
    - Vote Start - All people lock in
  - Game Options
    - set by
      - creator
      - Democracy
  - Player Options
    - Must be set before joining?
    - Set by the player


Other Players find game
  - Find by game hash
  - find by official Game Name
  - Find by Advertisement
  - Find By creator name
  - Find By Watcher
    - Find By Win/Loss record
    - Find By Leave

Other Players Joins Game
  - For Player to be ready
    - Download the game
    - Connect to Host
  - Display For other PLayers
    - Player Name
    - Player Ping
    - Download Status

When Everyone is Ready
  - What is Ready?
    - Each Player has downloaded the game
      - Prove by each player chooses a byte location
        - Initially
          - Each player reads 8 bytes starting from location
          - encrypts the 8 bytes using a private key
          - sends the encrypted 8 bytes
        - After All encrypted bytes are ready
          - Each player sends a decryption key
          - Each player decrypts other players bytes
            - If a player isn't the same as the others
              - player is not considered ready
              - player redownloads
    - Each Player customization finished and valid
    - Each Player connected to the host
    - Player "Locked in"
  - 3, 2, 1


Game
  - Watcher
    - watches for
      - Win/Loss
      - Leavers
  - If Game Ends
  - Has "game ended"
    - If player leaves before game ended, player is considered a leaver
  - Has "game winner" and "game loser"
    - Not
