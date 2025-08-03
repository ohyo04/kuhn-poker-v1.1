import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestSocketServer, createTestSocketClient, createMultipleTestClients, waitForSocketEvent, setupGameSocketHandlers, TestSocketServer, TestSocketClient } from './socketTestUtils.js';
describe('Socket.IO Integration Tests', () => {
    let testServer;
    let client1;
    let client2;
    beforeEach(async () => {
        // テストサーバーを作成
        testServer = await createTestSocketServer();
        setupGameSocketHandlers(testServer.server);
        // 2つのクライアントを作成
        [client1, client2] = await createMultipleTestClients(testServer.port, 2);
    });
    afterEach(async () => {
        // クリーンアップ
        client1?.disconnect();
        client2?.disconnect();
        await testServer?.close();
    });
    describe('基本的な接続テスト', () => {
        it('should connect to server successfully', () => {
            expect(client1.socket.connected).toBe(true);
            expect(client2.socket.connected).toBe(true);
        });
        it('should have unique socket IDs', () => {
            expect(client1.socket.id).toBeDefined();
            expect(client2.socket.id).toBeDefined();
            expect(client1.socket.id).not.toBe(client2.socket.id);
        });
    });
    describe('プレイヤー参加テスト', () => {
        it('should handle player joining game', async () => {
            // プレイヤー1がゲームに参加
            client1.socket.emit('joinGame', { username: 'Player1' });
            const response = await waitForSocketEvent(client1.socket, 'joinedGame');
            expect(response).toEqual({
                playerId: client1.socket.id,
                username: 'Player1'
            });
        });
        it('should handle multiple players joining', async () => {
            // 両方のプレイヤーがゲームに参加
            client1.socket.emit('joinGame', { username: 'Player1' });
            client2.socket.emit('joinGame', { username: 'Player2' });
            const [response1, response2] = await Promise.all([
                waitForSocketEvent(client1.socket, 'joinedGame'),
                waitForSocketEvent(client2.socket, 'joinedGame')
            ]);
            expect(response1.username).toBe('Player1');
            expect(response2.username).toBe('Player2');
            expect(response1.playerId).toBe(client1.socket.id);
            expect(response2.playerId).toBe(client2.socket.id);
        });
    });
    describe('ゲーム開始テスト', () => {
        it('should start game and send initial state', async () => {
            // ゲーム開始
            client1.socket.emit('startGame');
            const gameState = await waitForSocketEvent(client1.socket, 'gameStarted');
            expect(gameState).toEqual({
                playerCard: 'A',
                pot: 2,
                playerChips: 1,
                opponentChips: 1,
                currentPlayer: 'player'
            });
        });
    });
    describe('プレイヤーアクションテスト', () => {
        it('should handle bet action', async () => {
            client1.socket.emit('playerAction', { action: 'bet' });
            const result = await waitForSocketEvent(client1.socket, 'actionResult');
            expect(result).toEqual({
                action: 'bet',
                success: true,
                message: 'betしました'
            });
        });
        it('should handle check action', async () => {
            client1.socket.emit('playerAction', { action: 'check' });
            const result = await waitForSocketEvent(client1.socket, 'actionResult');
            expect(result).toEqual({
                action: 'check',
                success: true,
                message: 'checkしました'
            });
        });
        it('should handle call action', async () => {
            client1.socket.emit('playerAction', { action: 'call' });
            const result = await waitForSocketEvent(client1.socket, 'actionResult');
            expect(result).toEqual({
                action: 'call',
                success: true,
                message: 'callしました'
            });
        });
        it('should handle fold action', async () => {
            client1.socket.emit('playerAction', { action: 'fold' });
            const result = await waitForSocketEvent(client1.socket, 'actionResult');
            expect(result).toEqual({
                action: 'fold',
                success: true,
                message: 'foldしました'
            });
        });
    });
    describe('ルーム管理テスト', () => {
        it('should handle room joining', async () => {
            const roomId = 'room123';
            // プレイヤー1がルームに参加
            client1.socket.emit('joinGame', { username: 'Player1' });
            await waitForSocketEvent(client1.socket, 'joinedGame');
            client1.socket.emit('joinRoom', { roomId });
            // プレイヤー2がルームに参加
            client2.socket.emit('joinGame', { username: 'Player2' });
            await waitForSocketEvent(client2.socket, 'joinedGame');
            client2.socket.emit('joinRoom', { roomId });
            // プレイヤー1が新しいプレイヤーの参加を受信
            const joinNotification = await waitForSocketEvent(client1.socket, 'playerJoined');
            expect(joinNotification).toEqual({
                playerId: client2.socket.id,
                username: 'Player2'
            });
        });
        it('should handle room leaving', async () => {
            const roomId = 'room123';
            // 両方のプレイヤーがルームに参加
            client1.socket.emit('joinGame', { username: 'Player1' });
            client2.socket.emit('joinGame', { username: 'Player2' });
            await Promise.all([
                waitForSocketEvent(client1.socket, 'joinedGame'),
                waitForSocketEvent(client2.socket, 'joinedGame')
            ]);
            client1.socket.emit('joinRoom', { roomId });
            client2.socket.emit('joinRoom', { roomId });
            // プレイヤー2がルームを退出
            client2.socket.emit('leaveRoom', { roomId });
            // プレイヤー1が退出通知を受信
            const leaveNotification = await waitForSocketEvent(client1.socket, 'playerLeft');
            expect(leaveNotification).toEqual({
                playerId: client2.socket.id
            });
        });
    });
    describe('並行処理テスト', () => {
        it('should handle simultaneous actions from multiple players', async () => {
            // 両方のプレイヤーが同時にアクションを送信
            const promises = [
                (async () => {
                    client1.socket.emit('playerAction', { action: 'bet' });
                    return waitForSocketEvent(client1.socket, 'actionResult');
                })(),
                (async () => {
                    client2.socket.emit('playerAction', { action: 'check' });
                    return waitForSocketEvent(client2.socket, 'actionResult');
                })()
            ];
            const [result1, result2] = await Promise.all(promises);
            expect(result1.action).toBe('bet');
            expect(result2.action).toBe('check');
            expect(result1.success).toBe(true);
            expect(result2.success).toBe(true);
        });
    });
    describe('エラーハンドリングテスト', () => {
        it('should handle connection timeout', async () => {
            // 存在しないポートに接続を試行
            await expect(createTestSocketClient(99999)).rejects.toThrow();
        });
        it('should handle event timeout', async () => {
            // 存在しないイベントを待機
            await expect(waitForSocketEvent(client1.socket, 'nonexistentEvent', 100)).rejects.toThrow('Timeout waiting for event: nonexistentEvent');
        });
    });
    describe('パフォーマンステスト', () => {
        it('should handle multiple rapid actions', async () => {
            const actionCount = 10;
            const promises = [];
            // 大量のアクションを短時間で送信
            for (let i = 0; i < actionCount; i++) {
                promises.push((async () => {
                    client1.socket.emit('playerAction', { action: 'check' });
                    return waitForSocketEvent(client1.socket, 'actionResult');
                })());
            }
            const results = await Promise.all(promises);
            expect(results).toHaveLength(actionCount);
            results.forEach(result => {
                expect(result.action).toBe('check');
                expect(result.success).toBe(true);
            });
        });
    });
});
//# sourceMappingURL=socketIntegration.test.js.map