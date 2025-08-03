import { Server } from 'socket.io';
import { createServer } from 'http';
import type { AddressInfo } from 'net';

export const startTestServer = () => {
  const httpServer = createServer();
  const io = new Server(httpServer);
  
  return new Promise<{ server: Server; port: number }>((resolve) => {
    httpServer.listen(() => {
      const address = httpServer.address() as AddressInfo;
      resolve({ server: io, port: address.port });
    });
  });
};

export const createTestClient = (port: number) => {
  // テストクライアントの簡易実装
  return null;
};