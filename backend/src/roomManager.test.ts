import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RoomManager, Room } from './roomManager.js';

describe('Room Manager Tests', () => {
  let roomManager: RoomManager;

  beforeEach(() => {
    roomManager = new RoomManager();
  });

  describe('createRoom', () => {
    it('should create a new room with two players', () => {
      const room = roomManager.createRoom('room1', 'player1', 'player2');
      
      expect(room.id).toBe('room1');
      expect(room.players).toHaveLength(2);
      expect(room.players[0].socketId).toBe('player1');
      expect(room.players[0].username).toBe('Player 1');
      expect(room.players[1].socketId).toBe('player2');
      expect(room.players[1].username).toBe('Player 2');
      expect(room.gameState).toBeNull();
      expect(room.player1Stats).toEqual({ wins: 0, losses: 0 });
      expect(room.player2Stats).toEqual({ wins: 0, losses: 0 });
      expect(room.createdAt).toBeInstanceOf(Date);
      expect(room.lastActivity).toBeInstanceOf(Date);
    });

    it('should throw error when trying to create room with existing ID', () => {
      roomManager.createRoom('room1', 'player1', 'player2');
      
      expect(() => {
        roomManager.createRoom('room1', 'player3', 'player4');
      }).toThrow('Room room1 already exists');
    });
  });

  describe('getRoom', () => {
    it('should retrieve an existing room', () => {
      const createdRoom = roomManager.createRoom('room1', 'player1', 'player2');
      const retrievedRoom = roomManager.getRoom('room1');
      
      expect(retrievedRoom).toBeDefined();
      expect(retrievedRoom?.id).toBe('room1');
      expect(retrievedRoom).toEqual(createdRoom);
    });

    it('should return undefined for non-existing room', () => {
      const room = roomManager.getRoom('nonexistent');
      expect(room).toBeUndefined();
    });
  });

  describe('deleteRoom', () => {
    it('should delete an existing room', () => {
      roomManager.createRoom('room1', 'player1', 'player2');
      const deleted = roomManager.deleteRoom('room1');
      
      expect(deleted).toBe(true);
      expect(roomManager.getRoom('room1')).toBeUndefined();
      expect(roomManager.getRoomCount()).toBe(0);
    });

    it('should return false when trying to delete non-existing room', () => {
      const deleted = roomManager.deleteRoom('nonexistent');
      expect(deleted).toBe(false);
    });
  });

  describe('getRoomCount', () => {
    it('should return correct room count', () => {
      expect(roomManager.getRoomCount()).toBe(0);
      
      roomManager.createRoom('room1', 'player1', 'player2');
      expect(roomManager.getRoomCount()).toBe(1);
      
      roomManager.createRoom('room2', 'player3', 'player4');
      expect(roomManager.getRoomCount()).toBe(2);
      
      roomManager.deleteRoom('room1');
      expect(roomManager.getRoomCount()).toBe(1);
    });
  });

  describe('getAllRooms', () => {
    it('should return all rooms', () => {
      const room1 = roomManager.createRoom('room1', 'player1', 'player2');
      const room2 = roomManager.createRoom('room2', 'player3', 'player4');
      
      const allRooms = roomManager.getAllRooms();
      expect(allRooms).toHaveLength(2);
      expect(allRooms).toContain(room1);
      expect(allRooms).toContain(room2);
    });

    it('should return empty array when no rooms exist', () => {
      const allRooms = roomManager.getAllRooms();
      expect(allRooms).toEqual([]);
    });
  });

  describe('findRoomByPlayer', () => {
    it('should find room containing the player', () => {
      const room1 = roomManager.createRoom('room1', 'player1', 'player2');
      roomManager.createRoom('room2', 'player3', 'player4');
      
      const foundRoom = roomManager.findRoomByPlayer('player1');
      expect(foundRoom).toBeDefined();
      expect(foundRoom?.id).toBe('room1');
      expect(foundRoom).toEqual(room1);
    });

    it('should return undefined when player is not in any room', () => {
      roomManager.createRoom('room1', 'player1', 'player2');
      
      const foundRoom = roomManager.findRoomByPlayer('player3');
      expect(foundRoom).toBeUndefined();
    });
  });

  describe('removePlayerFromRoom', () => {
    it('should remove player from room', () => {
      roomManager.createRoom('room1', 'player1', 'player2');
      
      const room = roomManager.removePlayerFromRoom('player1');
      expect(room).toBeDefined();
      expect(room?.players).toHaveLength(1);
      expect(room?.players[0].socketId).toBe('player2');
    });

    it('should delete room when last player is removed', () => {
      roomManager.createRoom('room1', 'player1', 'player2');
      
      roomManager.removePlayerFromRoom('player1');
      const room = roomManager.removePlayerFromRoom('player2');
      
      expect(room).toBeUndefined();
      expect(roomManager.getRoom('room1')).toBeUndefined();
      expect(roomManager.getRoomCount()).toBe(0);
    });

    it('should return undefined when player is not in any room', () => {
      const room = roomManager.removePlayerFromRoom('nonexistent');
      expect(room).toBeUndefined();
    });
  });

  describe('updateRoomActivity', () => {
    it('should update room activity timestamp', () => {
      const room = roomManager.createRoom('room1', 'player1', 'player2');
      const originalActivity = room.lastActivity;
      
      // 少し待ってから更新
      setTimeout(() => {
        const updated = roomManager.updateRoomActivity('room1');
        const updatedRoom = roomManager.getRoom('room1');
        
        expect(updated).toBe(true);
        expect(updatedRoom?.lastActivity.getTime()).toBeGreaterThan(originalActivity.getTime());
      }, 10);
    });

    it('should return false for non-existing room', () => {
      const updated = roomManager.updateRoomActivity('nonexistent');
      expect(updated).toBe(false);
    });
  });

  describe('cleanupInactiveRooms', () => {
    beforeEach(() => {
      // Dateをモックして時間制御
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should delete rooms that exceed inactivity threshold', () => {
      const room1 = roomManager.createRoom('room1', 'player1', 'player2');
      const room2 = roomManager.createRoom('room2', 'player3', 'player4');
      
      // 時間を進める（2秒）
      vi.advanceTimersByTime(2000);
      
      // 1秒の閾値で非アクティブルームをクリーンアップ
      const deletedRooms = roomManager.cleanupInactiveRooms(1000);
      
      expect(deletedRooms).toEqual(['room1', 'room2']);
      expect(roomManager.getRoomCount()).toBe(0);
    });

    it('should not delete rooms within activity threshold', () => {
      roomManager.createRoom('room1', 'player1', 'player2');
      
      // 500ms進める
      vi.advanceTimersByTime(500);
      
      // 1秒の閾値でクリーンアップ（まだ非アクティブではない）
      const deletedRooms = roomManager.cleanupInactiveRooms(1000);
      
      expect(deletedRooms).toEqual([]);
      expect(roomManager.getRoomCount()).toBe(1);
    });
  });

  describe('updatePlayerStats', () => {
    it('should update player1 stats correctly', () => {
      roomManager.createRoom('room1', 'player1', 'player2');
      
      // プレイヤー1の勝利を記録
      const updated = roomManager.updatePlayerStats('room1', 'player1', true);
      const room = roomManager.getRoom('room1');
      
      expect(updated).toBe(true);
      expect(room?.player1Stats.wins).toBe(1);
      expect(room?.player1Stats.losses).toBe(0);
      expect(room?.player2Stats.wins).toBe(0);
      expect(room?.player2Stats.losses).toBe(0);
    });

    it('should update player2 stats correctly', () => {
      roomManager.createRoom('room1', 'player1', 'player2');
      
      // プレイヤー2の敗北を記録
      const updated = roomManager.updatePlayerStats('room1', 'player2', false);
      const room = roomManager.getRoom('room1');
      
      expect(updated).toBe(true);
      expect(room?.player1Stats.wins).toBe(0);
      expect(room?.player1Stats.losses).toBe(0);
      expect(room?.player2Stats.wins).toBe(0);
      expect(room?.player2Stats.losses).toBe(1);
    });

    it('should return false for non-existing room', () => {
      const updated = roomManager.updatePlayerStats('nonexistent', 'player1', true);
      expect(updated).toBe(false);
    });
  });

  describe('multiple rooms management', () => {
    it('should manage multiple rooms simultaneously', () => {
      const room1 = roomManager.createRoom('room1', 'player1', 'player2');
      const room2 = roomManager.createRoom('room2', 'player3', 'player4');
      const room3 = roomManager.createRoom('room3', 'player5', 'player6');
      
      expect(roomManager.getRoomCount()).toBe(3);
      
      // 各ルームが独立して動作
      roomManager.updatePlayerStats('room1', 'player1', true);
      roomManager.updatePlayerStats('room2', 'player3', false);
      
      const updatedRoom1 = roomManager.getRoom('room1');
      const updatedRoom2 = roomManager.getRoom('room2');
      const updatedRoom3 = roomManager.getRoom('room3');
      
      expect(updatedRoom1?.player1Stats.wins).toBe(1);
      expect(updatedRoom2?.player1Stats.losses).toBe(1);
      expect(updatedRoom3?.player1Stats.wins).toBe(0);
      expect(updatedRoom3?.player1Stats.losses).toBe(0);
    });
  });
});