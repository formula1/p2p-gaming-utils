# 3 Types of peer to peer syncing

1. Single Source of truth

2. Lockstep
  - Get ntp (Longest amount of milliseconds that it takes for an individual to )
  - Send out an action and time


3. Turnbased
  - each turn one or more people need to do an action
  - Each player encrypts their move and sends to everyone else
    - each person who receives the move, responds with an accept
  - When all people have sent their move
    - Each person sends their decryption key
