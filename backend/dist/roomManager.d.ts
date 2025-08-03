import type { GameState } from './gameLogic.js';
export interface Room {
    id: string;
    players: {
        socketId: string;
        username: string;
        userId?: string;
    }[];
    gameState: GameState | null;
    player1Stats: {
        wins: number;
        losses: number;
    };
    player2Stats: {
        wins: number;
        losses: number;
    };
    createdAt: Date;
    lastActivity: Date;
    dbGameId?: string;
    gameMode?: 'ai' | 'random' | 'friend';
}
export declare class RoomManager {
    private rooms;
    createRoom(roomId: string, player1Id: string, player2Id: string): Room;
    getRoom(roomId: string): Room | undefined;
    deleteRoom(roomId: string): boolean;
    getRoomCount(): number;
    getAllRooms(): Room[];
    findRoomByPlayer(playerId: string): Room | undefined;
    removePlayerFromRoom(playerId: string): Room | undefined;
    updateRoomActivity(roomId: string): boolean;
    cleanupInactiveRooms(inactiveThresholdMs: number): string[];
    updatePlayerStats(roomId: string, playerId: string, won: boolean): boolean;
}
//# sourceMappingURL=roomManager.d.ts.map