export interface SocketCommunicator {
  send(data: any): void
  broadcast(data: any): void
}
