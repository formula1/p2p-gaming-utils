# How to start it?

Its been such a long time since I've worked on this project that I have no idea.


Probably a
- in terminal - `sudo docker-compose up`
- in a browser go to - `http://localhost:${the public port}`
  - although it seems no public port has been set which is an oversite on my part
  - I plan to come back to this, just not yet


# General Idea

- Players create a game
  - they choose their game file
  - They choose their type of hosting
    - Dedicated host
    - Player host - The fastest player hosts for everyone
    - 1 to 1 connectins - everyone has a connection to everyone else
  - Maximum number of players if applicable, some game's only support 1 player or 1v1
    - Some games have a minimum of players
    - Some games have free for all mode and others have team mode
    - Sometimes order matters, sometimes it doesn't, sometimes randomness happens regardless
    - For free for all, Any number of players is allowed up to the limit set by the game
    - For team mode
      - The number of players should be divisible by the number of teams
      - But due to people leaving and some fun games being unpopular, that's not always an option
  - Configuration expected by the game
    - this might be something like in dota
      - Ban list
      - Hard mode
    - It's configured ahead of time so people won't be able to change it in game
  - Some games expect a configuration set by players before hand
    - Examples
      - Magic the gathering
      - Pokemon
    - Is there a way to verify a players configuration anonomously before hand?
      - in magic, the deck is hidden. This adds suspense and mystery
      - At the very least, the number of cards per deck might be counted. But that might be too much information
- The lobby gets created
- People can find game lobbies based on game title, user description or game description. Perhaps more
- Each game lobby has
  - a user set description -  LURKER DEFENSE GOGOGO
  - The image the game made
  - The title of the game
  - The description of the game
  - Player configuration
    - 1v1
    - Free for all - how many max players
    - Teams - how many teams and max players
  - The Game configuration
    - Unique to the game

- If the game that the lobby is created for requires a player configuration
  - There is a popup dialog that makes the player to choose one or more configurations
  - Or they can create a new configuation
  - Perhaps they can choose a url and use a configuration from the internet
- If the game starts or gets filled before their configuration is finished, they are notified

- While in the lobby
  - The player has the ability to chat with others in the lobby
  - The game is downloaded via webtorrent from the other players
    - this should be faster and less burdensome on the server
  - The players all connect to the host or eachother
  - The Players also Share their public encryption key with the newly joined player
    - The newly joined player then
      - creates a unique shared key for a single other player
      - Encrypts that shared key with the other players public encryption key
  - The new player also creates a public encryption key
    - The other players create a shared key for that player as well
  - The lobby creator can attempt to update the player or game configuration
    - The other players may veto the configuration by popular vote
    - The vote has 20 seconds o pass, otherwise the only votes are counted or new configuartion is accepted
    - If the lobby creator is the only player, it gets automatically accepted
  - The lobby creator can switch players in reagrd to team and/or order
    - The other players may veto the configuration by popular vote
    - The vote has 20 seconds o pass, otherwise the only votes are counted or new configuartion is accepted
    - If the lobby creator is the only player, it gets automatically accepted
  - I player may ask another player to switch with them in regard to team and/or order
    - if the other player accepts, they switch
  - When all players have downloaded the game
    - the lobby creator can start
    - 5, 4, 3, 2, 1
    - Game starts

  - In Game
    - There is still a chat available but overall the contents are out of my control
    - For live games there is also a timer
      - if someone starts to lag behind
        - The game stops
        - The game waits for that person to catch up
        - If that person doesn't catch up in time or is a repeat lagger, the other players can kick them
      - For hosting
        - messages are encrypted and sent to the host for which the host shares with everyone else
        - the host can kick a person for whatever reason they want
    - For Move games
      - For shared turns where players play a turn at the same time (like pokemon)
        - The player creates a new encryption/decryption key and encrypts the move
        - The player then sends the encrypted move to all other players
        - When all players have made a move or a time limit is up
          - The player sends the encryption/decryption key to the other players for them to decrypt the move
        - The encryption/decryption key should be unique each time
      For shared turns where each player gets a turn one at a time
      - There is a "prepare step" then a "commit step"
      - The player can make whatever moves they want

# Ladder
- Ranked vs Unranked games
- Allow people to play other players of similar calibur so that they can enjoy themselves

# Artificial Intelligence
- Making bots is a pretty good idea to make asure people can still have fun offline
- perhaps there can be a "bot only" ladder for games to figure out whos the best

# Interesting Game Configurations
- Anonmyous Mode in turn based game
  - A players stats like life total or points till win are public although their name is unknown
  - To send move messages, perhaps use something like tor routing.
    - psuedocode
      - Each player has a public encryption key
      - a player chooses multiple end points and encrypts the message multiple times
        - Each level of encryption has the next message as well as who they are expected to send to
      - the reciever is then expected to decrypt the message and pass it along
      - until the very end when the final user releases the information
    - Issue
      - if one person is 5 players and another is 1, they know exactly where a message is coming fom
    encrypts a message multiple times and orders it to come out of another user
  - People Know who their targeting but don't know where an action is coming from
    - This makes diplomacy much more difficult
  - For turned based games, the order of the people should be randomized
    - However people will know that certian things like permanents and spells are owned by that player
      - since the turn order is preset
      - Although maybe its possible to randomize the turns until the last person has been chosen and it gets randomized again
    - Nobody else can use them
  - For same turn games - nobody knows where the move is coming from
    - Can we support complete anonymity or can we only support single person anonymity
      - the problem with complete anomyity is how will we know a player lost or won if we can't track them at all?
      - We can't track them. Perhaps theres no losers but there can be a winner
      - Psuedo code for detecting a winner
        - Each person starts with a private encrypt/decrypt key
        - They encrypt the message 0000 0000 0000 0000 or 0123456789, something predictable and long
        - When a player reaches a win condition, they are then expected to share the private encrypt/decrypt key
        - Everyone can then verify that it was that individual who one
    - To track a single series of actions seperate from a player
      - For each turn
        - Person creates a private encrypt/decryption key
        - encrypts the message 0000 0000 0000 0000
        - sends that encrypted message along with the players turn info
      - The next time a player does an axtion
        - They pass in the encrypt/decrypt key from the last turn
        - then they create a new encryption key and it goes again
      - If a player were to lose, I don't think it can be tracked unless we know a player's actions is related to a specific player
        - As a result, tracking a single string of actions but not tying that string to a player can't result in a loss condition
        - Must be a win similar to complete anonymity
    - To track a single series of actions but tie it to a player
      - We have the opportunity to create a loss condition
      - At the start of the game
        - Person creates a private encrypt/decryption key
        - encrypts the message 0000 0000 0000 0000
        - sends that encrypted message to all other players notifying them it was the individual
        - All other players store that encrypted message and relate it to the player's id
      - Each turn
        - The player encrypts a new message
        - Passes the decryption key to the last one
        - This lets the other players know that the message came from that player
        - All other players store the new encrypted message and relate it to the player's id
    - The only way we know its from the same person is
- The fair algorithm
  - I don't know how to calculate but it goes something like this
    - 1001 0110 0110 1001 0110 1001 1001 0110 0110 1001 1001 0110 1001 0110 0110 1001
  - I'm unure how to handle larger groups like 3,4,5 etc... only 1v1  
