import { GameState } from './gameLogic.js';

export interface Room {
  id: string;
  players: { socketId: string, username: string }[];
  gameState: GameState | null;
  player1Stats: { wins: number, losses: number };
  player2Stats: { wins: number, losses: number };
  createdAt: Date;
  lastActivity: Date;
}

export class RoomManager {
  private rooms: Record<string, Room> = {};

  // ルームを作成
  createRoom(roomId: string, player1Id: string, player2Id: string): Room {
    if (this.rooms[roomId]) {
      throw new Error(`Room ${roomId} already exists`);
    }

    const room: Room = {
      id: roomId,
      players: [
        { socketId: player1Id, username: 'Player 1' },
        { socketId: player2Id, username: 'Player 2' }
      ],
      gameState: null,
      player1Stats: { wins: 0, losses: 0 },
      player2Stats: { wins: 0, losses: 0 },
      createdAt: new Date(),
      lastActivity: new Date()
    };

    this.rooms[roomId] = room;
    return room;
  }

  // ルームを取得
  getRoom(roomId: string): Room | undefined {
    return this.rooms[roomId];
  }

  // ルームを削除
  deleteRoom(roomId: string): boolean {
    if (this.rooms[roomId]) {
      delete this.rooms[roomId];
      return true;
    }
    return false;
  }

  // アクティブなルーム数を取得
  getRoomCount(): number {
    return Object.keys(this.rooms).length;
  }

  // すべてのルームを取得
  getAllRooms(): Room[] {
    return Object.values(this.rooms);
  }

  // プレイヤーがいるルームを検索
  findRoomByPlayer(playerId: string): Room | undefined {
    return Object.values(this.rooms).find(room => 
      room.players.some(player => player.socketId === playerId)
    );
  }

  // プレイヤーをルームから削除
  removePlayerFromRoom(playerId: string): Room | undefined {
    const room = this.findRoomByPlayer(playerId);
    if (!room) return undefined;

    room.players = room.players.filter(player => player.socketId !== playerId);
    
    // プレイヤーが0人になったらルームを削除
    if (room.players.length === 0) {
      this.deleteRoom(room.id);
      return undefined;
    }

    room.lastActivity = new Date();
    return room;
  }

  // ルームの最終活動時間を更新
  updateRoomActivity(roomId: string): boolean {
    const room = this.rooms[roomId];
    if (room) {
      room.lastActivity = new Date();
      return true;
    }
    return false;
  }

  // 非アクティブなルームを削除（指定時間以上活動がないルーム）
  cleanupInactiveRooms(inactiveThresholdMs: number): string[] {
    const now = new Date();
    const deletedRoomIds: string[] = [];

    for (const [roomId, room] of Object.entries(this.rooms)) {
      const timeSinceLastActivity = now.getTime() - room.lastActivity.getTime();
      if (timeSinceLastActivity > inactiveThresholdMs) {
        this.deleteRoom(roomId);
        deletedRoomIds.push(roomId);
      }
    }

    return deletedRoomIds;
  }

  // プレイヤーの勝敗を更新
  updatePlayerStats(roomId: string, playerId: string, won: boolean): boolean {
    const room = this.rooms[roomId];
    if (!room) return false;

    const isPlayer1 = room.players[0]?.socketId === playerId;
    
    if (isPlayer1) {
      if (won) room.player1Stats.wins++;
      else room.player1Stats.losses++;
    } else {
      if (won) room.player2Stats.wins++;
      else room.player2Stats.losses++;
    }

    room.lastActivity = new Date();
    return true;
  }
}