export declare class RoomCodeService {
    static generateRoomCode(): string;
    static isCodeUnique(code: string): Promise<boolean>;
    static generateUniqueRoomCode(): Promise<string>;
    static createRoom(creatorId: string): Promise<{
        roomCode: string;
        roomId: string;
    }>;
    static findRoomByCode(roomCode: string): Promise<any>;
    static joinRoom(roomCode: string, playerId: string): Promise<any>;
}
//# sourceMappingURL=roomCodeService.d.ts.map