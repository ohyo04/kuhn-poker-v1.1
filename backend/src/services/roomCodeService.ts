// 一時的な実装（メモリストレージを使用）
const tempRooms: { [key: string]: any } = {};

export class RoomCodeService {
  // 6桁のランダムコードを生成
  static generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // ルームコードの重複チェック
  static async isCodeUnique(code: string): Promise<boolean> {
    return !tempRooms[code];
  }

  // ユニークなルームコードを生成
  static async generateUniqueRoomCode(): Promise<string> {
    let code: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      code = this.generateRoomCode();
      isUnique = await this.isCodeUnique(code);
      attempts++;
      
      if (attempts >= maxAttempts) {
        throw new Error('Failed to generate unique room code');
      }
    } while (!isUnique);
    
    return code;
  }

  // ルーム作成
  static async createRoom(creatorId: string): Promise<{ roomCode: string; roomId: string }> {
    const roomCode = await this.generateUniqueRoomCode();
    const roomId = `room_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24時間後
    
    tempRooms[roomCode] = {
      id: roomId,
      roomCode,
      creatorId,
      expiresAt,
      status: 'waiting',
      gameMode: 'friend'
    };

    console.log(`Room created: ${roomCode}, ID: ${roomId}`);
    return { roomCode, roomId };
  }

  // ルームコードでルーム検索
  static async findRoomByCode(roomCode: string) {
    return tempRooms[roomCode] || null;
  }

  // ルーム参加
  static async joinRoom(roomCode: string, playerId: string) {
    const room = await this.findRoomByCode(roomCode);
    
    if (!room) {
      throw new Error('ルームが見つかりません');
    }
    
    if (room.status !== 'waiting') {
      throw new Error('このルームは既に開始されているか終了しています');
    }
    
    if (new Date() > room.expiresAt) {
      throw new Error('このルームは期限切れです');
    }

    // ルームステータスを更新
    room.status = 'active';
    console.log(`Player joined room: ${roomCode}`);
    return room;
  }
}