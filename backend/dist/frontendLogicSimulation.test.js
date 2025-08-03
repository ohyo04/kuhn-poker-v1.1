import { describe, it, expect, vi, beforeEach } from 'vitest';
describe('Frontend Logic Simulation Tests', () => {
    // 🔧 修正: 共通関数として定義
    const createInitialGameState = () => ({
        playerCard: 'A',
        opponentCard: 'K',
        pot: 2,
        playerChips: 1,
        opponentChips: 1,
        currentPlayer: 'player',
        isGameActive: true,
        showOpponentCard: false,
        wins: 0,
        losses: 0,
        gamePhase: 'ゲーム開始',
        playerAction: null,
        opponentAction: null,
        waitingForOpponent: false,
        betAmount: 1,
        gameMode: 'ai'
    });
    const getAvailableActions = (gameState) => {
        const isPlayerTurn = gameState.currentPlayer === 'player' &&
            gameState.isGameActive &&
            !gameState.waitingForOpponent;
        if (!isPlayerTurn)
            return [];
        if (!gameState.playerAction && !gameState.opponentAction) {
            return ['bet', 'check'];
        }
        if (gameState.opponentAction === 'bet') {
            return ['call', 'fold'];
        }
        if (gameState.opponentAction === 'check' && gameState.playerAction === 'check') {
            return [];
        }
        return ['bet', 'check'];
    };
    const shouldShowActionButtons = (gameState) => {
        return getAvailableActions(gameState).length > 0;
    };
    const shouldShowOpponentCard = (gameState) => {
        return gameState.showOpponentCard;
    };
    const shouldShowNewGameButton = (gameState) => {
        return !gameState.isGameActive;
    };
    const getGameStatusMessage = (gameState) => {
        if (!gameState.isGameActive)
            return 'Game Over';
        if (gameState.waitingForOpponent)
            return 'Waiting for opponent';
        if (gameState.currentPlayer === 'player')
            return 'Your turn';
        return 'Opponent turn';
    };
    const calculateWinRate = (wins, losses) => {
        const totalGames = wins + losses;
        return totalGames > 0 ? (wins / totalGames * 100).toFixed(1) : '0.0';
    };
    const formatGameStats = (wins, losses) => {
        return `Wins: ${wins} | Losses: ${losses}`;
    };
    describe('基本的なUI表示ロジック', () => {
        let initialGameState;
        beforeEach(() => {
            initialGameState = createInitialGameState();
        });
        it('should show correct initial actions', () => {
            const actions = getAvailableActions(initialGameState);
            expect(actions).toEqual(['bet', 'check']);
            expect(shouldShowActionButtons(initialGameState)).toBe(true);
        });
        it('should show call/fold after opponent bet', () => {
            const gameState = {
                ...initialGameState,
                opponentAction: 'bet',
                currentPlayer: 'player'
            };
            const actions = getAvailableActions(gameState);
            expect(actions).toEqual(['call', 'fold']);
        });
        it('should hide buttons when not player turn', () => {
            const gameState = {
                ...initialGameState,
                currentPlayer: 'opponent'
            };
            expect(shouldShowActionButtons(gameState)).toBe(false);
        });
        it('should show correct game status', () => {
            expect(getGameStatusMessage(initialGameState)).toBe('Your turn');
            const opponentTurn = { ...initialGameState, currentPlayer: 'opponent' };
            expect(getGameStatusMessage(opponentTurn)).toBe('Opponent turn');
            const gameOver = { ...initialGameState, isGameActive: false };
            expect(getGameStatusMessage(gameOver)).toBe('Game Over');
        });
    });
    describe('プレイヤーアクション', () => {
        let mockHandler;
        beforeEach(() => {
            mockHandler = vi.fn();
        });
        it('should handle all actions', () => {
            const actions = ['bet', 'check', 'call', 'fold'];
            actions.forEach(action => mockHandler(action));
            expect(mockHandler).toHaveBeenCalledTimes(4);
            expect(mockHandler).toHaveBeenNthCalledWith(1, 'bet');
            expect(mockHandler).toHaveBeenNthCalledWith(2, 'check');
            expect(mockHandler).toHaveBeenNthCalledWith(3, 'call');
            expect(mockHandler).toHaveBeenNthCalledWith(4, 'fold');
        });
    });
    describe('ゲームフロー', () => {
        it('should simulate bet -> call -> showdown', () => {
            let gameState = createInitialGameState(); // 🔧 修正: 関数呼び出しに変更
            const flow = [];
            // プレイヤーベット
            expect(getAvailableActions(gameState)).toContain('bet');
            flow.push('player:bet');
            gameState = {
                ...gameState,
                playerAction: 'bet',
                currentPlayer: 'opponent',
                waitingForOpponent: true
            };
            expect(shouldShowActionButtons(gameState)).toBe(false);
            // 相手コール
            gameState = {
                ...gameState,
                opponentAction: 'call',
                showOpponentCard: true,
                isGameActive: false
            };
            flow.push('opponent:call');
            flow.push('showdown');
            expect(flow).toEqual(['player:bet', 'opponent:call', 'showdown']);
            expect(shouldShowOpponentCard(gameState)).toBe(true);
            expect(shouldShowNewGameButton(gameState)).toBe(true);
        });
        it('should simulate check -> check -> showdown', () => {
            let gameState = createInitialGameState(); // 🔧 修正: 関数呼び出しに変更
            const flow = [];
            flow.push('player:check');
            gameState = {
                ...gameState,
                playerAction: 'check',
                currentPlayer: 'opponent'
            };
            flow.push('opponent:check');
            gameState = {
                ...gameState,
                opponentAction: 'check',
                showOpponentCard: true,
                isGameActive: false
            };
            flow.push('showdown');
            expect(flow).toEqual(['player:check', 'opponent:check', 'showdown']);
            expect(getAvailableActions(gameState)).toEqual([]);
        });
    });
    describe('統計情報', () => {
        it('should calculate win rate correctly', () => {
            expect(calculateWinRate(7, 3)).toBe('70.0');
            expect(calculateWinRate(0, 0)).toBe('0.0');
            expect(calculateWinRate(10, 0)).toBe('100.0');
        });
        it('should format stats correctly', () => {
            expect(formatGameStats(5, 3)).toBe('Wins: 5 | Losses: 3');
            expect(formatGameStats(0, 0)).toBe('Wins: 0 | Losses: 0');
        });
    });
    describe('UI状態管理', () => {
        it('should manage button visibility', () => {
            const activeGame = createInitialGameState(); // 🔧 修正
            const waitingGame = { ...createInitialGameState(), waitingForOpponent: true }; // 🔧 修正
            const finishedGame = { ...createInitialGameState(), isGameActive: false }; // 🔧 修正
            expect(shouldShowActionButtons(activeGame)).toBe(true);
            expect(shouldShowActionButtons(waitingGame)).toBe(false);
            expect(shouldShowActionButtons(finishedGame)).toBe(false);
            expect(shouldShowNewGameButton(activeGame)).toBe(false);
            expect(shouldShowNewGameButton(waitingGame)).toBe(false);
            expect(shouldShowNewGameButton(finishedGame)).toBe(true);
        });
        it('should manage card visibility', () => {
            const hiddenCard = createInitialGameState(); // 🔧 修正
            const revealedCard = { ...createInitialGameState(), showOpponentCard: true }; // 🔧 修正
            expect(shouldShowOpponentCard(hiddenCard)).toBe(false);
            expect(shouldShowOpponentCard(revealedCard)).toBe(true);
        });
    });
    describe('ユーザー入力検証', () => {
        it('should validate different game states', () => {
            const initialState = createInitialGameState();
            const scenarios = [
                {
                    state: initialState,
                    expected: ['bet', 'check']
                },
                {
                    state: { ...initialState, opponentAction: 'bet' }, // 🔧 修正: initialGameState → initialState
                    expected: ['call', 'fold']
                },
                {
                    state: { ...initialState, currentPlayer: 'opponent' }, // 🔧 修正: initialGameState → initialState
                    expected: []
                },
                {
                    state: { ...initialState, isGameActive: false }, // 🔧 修正: initialGameState → initialState
                    expected: []
                }
            ];
            scenarios.forEach(scenario => {
                expect(getAvailableActions(scenario.state)).toEqual(scenario.expected);
            });
        });
    });
});
//# sourceMappingURL=frontendLogicSimulation.test.js.map