import { createContext } from "react";

const SocketContext = createContext({
  websocket: void 0,
});
SocketContext.displayName = 'WebSocket';
export {
  SocketContext
}
