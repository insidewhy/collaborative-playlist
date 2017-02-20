export interface SocketCommunicator {
  send(type: string, payload: any): void
  broadcast(type: string, payload: any): void
}
