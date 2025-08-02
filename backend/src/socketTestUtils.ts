import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { AddressInfo } from 'net';
import { io as Client, Socket as ClientSocket } from 'socket.io-client';

export interface TestSocketServer {
  server: SocketIOServer;
  port: number;
  close: () => Promise<void>;
}

export interface TestSocketClient {
  socket: ClientSocket;
  disconnect: () => void;
}

// テスト用Socket.IOサーバーを作成
export async function createTestSocketServer(): Promise<TestSocketServer> {
  const httpServer = createServer();
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  return new Promise((resolve) => {
    httpServer.listen(() => {
      const port = (httpServer.address() as AddressInfo).port;
      
      resolve({
        server: io,
        port,
        close: async () => {
          return new Promise((closeResolve) => {
            io.close(() => {
              httpServer.close(() => {
                closeResolve();
              });
            });
          });
        }
      });
    });
  });
}

// テスト用Socket.IOクライアントを作成
export async function createTestSocketClient(port: number): Promise<TestSocketClient> {
  const socket = Client(`http://localhost:${port}`);

  return new Promise((resolve, reject) => {
    socket.on('connect', () => {
      resolve({
        socket,
        disconnect: () => socket.disconnect()
      });
    });

    socket.on('connect_error', (error) => {
      reject(error);
    });

    // タイムアウト設定
    setTimeout(() => {
      reject(new Error('Connection timeout'));
    }, 5000);
  });
}

// Socket.IOイベントの待機ヘルパー
export function waitForSocketEvent<T>(socket: ClientSocket, eventName: string, timeoutMs: number = 1000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout waiting for event: ${eventName}`));
    }, timeoutMs);

    socket.once(eventName, (data: T) => {
      clearTimeout(timeout);
      resolve(data);
    });
  });
}

// 複数のSocket.IOクライアントを同時に作成
export async function createMultipleTestClients(port: number, count: number): Promise<TestSocketClient[]> {
  const clients: TestSocketClient[] = [];
  
  for (let i = 0; i < count; i++) {
    const client = await createTestSocketClient(port);
    clients.push(client);
  }
  
  return clients;
}

// Socket.IOサーバーにゲームロジックを追加
export function setupGameSocketHandlers(io: SocketIOServer) {
  io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    // プレイヤー参加
    socket.on('joinGame', (data: { username: string }) => {
      socket.data.username = data.username;
      socket.emit('joinedGame', { 
        playerId: socket.id, 
        username: data.username 
      });
    });

    // ゲーム開始
    socket.on('startGame', () => {
      socket.emit('gameStarted', {
        playerCard: 'A',
        pot: 2,
        playerChips: 1,
        opponentChips: 1,
        currentPlayer: 'player'
      });
    });

    // プレイヤーアクション
    socket.on('playerAction', (data: { action: string }) => {
      socket.emit('actionResult', {
        action: data.action,
        success: true,
        message: `${data.action}しました`
      });
    });

    // ルーム参加
    socket.on('joinRoom', (data: { roomId: string }) => {
      socket.join(data.roomId);
      socket.to(data.roomId).emit('playerJoined', {
        playerId: socket.id,
        username: socket.data.username
      });
    });

    // ルーム退出
    socket.on('leaveRoom', (data: { roomId: string }) => {
      socket.leave(data.roomId);
      socket.to(data.roomId).emit('playerLeft', {
        playerId: socket.id
      });
    });

    // 切断
    socket.on('disconnect', () => {
      console.log('Player disconnected:', socket.id);
    });
  });
}