Create a room
- room name
- min users
- max users
- type of game
  - turn based
  - Lock Step
  - Roll Back
- users

Join a room


Start the room
- need a host
- setup game necessities
  - each user connects to host
  - synchronize random, Send mersenne twister seed
  - synchronize Clock
- start game
  - run tests




Get time it takes to send a message
- get timestamp as "START_TIME"
- send to user, user sends back
- get timestamp as "END_TIME"
- subtract the two and divide
  - Its amount of time it takes to send action

Single Source of truth
- All players send action to a "host"
- "Host" sends actions to all other players

Lock Step
- Create a time per step
- when sending action, set # of steps

Roll Back
- When sending action
  - send timestamp the action happened
  - Each player reverses and runs clock with the action

Move
- 3 person game as (A, B, C)
- Person A takes action
- Person B takes action
- Person C takes action
- All 3 players send encrypted action with hash
  - when all players send encrypted action with hash
    - each player send decryption key
    - Double check if it is proper action by checking the hash to be equal to a hashed decrypted value
