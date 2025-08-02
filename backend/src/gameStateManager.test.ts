import { describe, it, expect, beforeEach } from 'vitest';
import { GameStateManager, GameAction } from './gameStateManager.js';
import { GameState } from './gameLogic.js';

describe('Game State Manager Tests', () => {
  let gameManager: GameStateManager;
  let initialGameState: GameState;

  beforeEach(() => {
    gameManager = new GameStateManager();
    
    initialGameState = {
      playerCard: 'A',
      opponentCard: 'K',
      pot: 2,
      playerChips: 1,
      opponentChips: 1,
      betAmount: 1,
      wins: 0,
      losses: 0,
      ev: 2.0,
      gamePhase: "ゲーム開始",
      currentPlayer: 'player',
      gameStage: 'betting',
      playerAction: null,
      opponentAction: null,
      isGameActive: true,
      showOpponentCard: false,
      waitingForOpponent: false
    };
  });

  describe('applyPlayerAction', () => {
    describe('bet action', () => {
      it('should apply player bet correctly', () => {
        const result = gameManager.applyPlayerAction(initialGameState, 'bet', true);
        
        expect(result.newState.pot).toBe(3); // 2 + 1
        expect(result.newState.playerChips).toBe(0); // 1 - 1
        expect(result.newState.opponentChips).toBe(1); // unchanged
        expect(result.newState.playerAction).toBe('bet');
        expect(result.newState.currentPlayer).toBe('opponent');
        expect(result.newState.waitingForOpponent).toBe(true);
        expect(result.shouldShowdown).toBe(false);
        expect(result.gameEnded).toBe(false);
        expect(result.message).toBe("ベットしました。相手の番です。");
      });

      it('should apply opponent bet correctly', () => {
        const stateWithOpponentTurn = { ...initialGameState, currentPlayer: 'opponent' as const };
        const result = gameManager.applyPlayerAction(stateWithOpponentTurn, 'bet', false);
        
        expect(result.newState.pot).toBe(3);
        expect(result.newState.playerChips).toBe(1); // unchanged
        expect(result.newState.opponentChips).toBe(0); // 1 - 1
        expect(result.newState.opponentAction).toBe('bet');
        expect(result.newState.currentPlayer).toBe('player');
        expect(result.newState.waitingForOpponent).toBe(false);
      });

      it('should throw error when insufficient chips', () => {
        const stateWithNoChips = { ...initialGameState, playerChips: 0 };
        
        expect(() => {
          gameManager.applyPlayerAction(stateWithNoChips, 'bet', true);
        }).toThrow('Insufficient chips to bet');
      });
    });

    describe('check action', () => {
      it('should apply single check correctly', () => {
        const result = gameManager.applyPlayerAction(initialGameState, 'check', true);
        
        expect(result.newState.playerAction).toBe('check');
        expect(result.newState.opponentAction).toBe(null);
        expect(result.newState.currentPlayer).toBe('opponent');
        expect(result.newState.waitingForOpponent).toBe(true);
        expect(result.shouldShowdown).toBe(false);
        expect(result.gameEnded).toBe(false);
        expect(result.message).toBe("チェックしました。相手の番です。");
      });

      it('should trigger showdown when both players check', () => {
        const stateWithPlayerCheck = { 
          ...initialGameState, 
          playerAction: 'check' as const,
          currentPlayer: 'opponent' as const
        };
        
        const result = gameManager.applyPlayerAction(stateWithPlayerCheck, 'check', false);
        
        expect(result.newState.playerAction).toBe('check');
        expect(result.newState.opponentAction).toBe('check');
        expect(result.newState.gameStage).toBe('showdown');
        expect(result.newState.waitingForOpponent).toBe(false);
        expect(result.shouldShowdown).toBe(true);
        expect(result.gameEnded).toBe(false);
        expect(result.message).toBe("両者チェック。ショーダウンです！");
      });
    });

    describe('call action', () => {
      it('should apply call correctly', () => {
        const result = gameManager.applyPlayerAction(initialGameState, 'call', true);
        
        expect(result.newState.pot).toBe(3); // 2 + 1
        expect(result.newState.playerChips).toBe(0); // 1 - 1
        expect(result.newState.playerAction).toBe('call');
        expect(result.newState.gameStage).toBe('showdown');
        expect(result.newState.waitingForOpponent).toBe(false);
        expect(result.shouldShowdown).toBe(true);
        expect(result.gameEnded).toBe(false);
        expect(result.message).toBe("コールしました。ショーダウンです！");
      });

      it('should throw error when insufficient chips for call', () => {
        const stateWithNoChips = { ...initialGameState, playerChips: 0 };
        
        expect(() => {
          gameManager.applyPlayerAction(stateWithNoChips, 'call', true);
        }).toThrow('Insufficient chips to call');
      });
    });

    describe('fold action', () => {
      it('should apply player fold correctly', () => {
        const result = gameManager.applyPlayerAction(initialGameState, 'fold', true);
        
        expect(result.newState.playerAction).toBe('fold');
        expect(result.newState.losses).toBe(1);
        expect(result.newState.opponentChips).toBe(3); // 1 + 2 (pot)
        expect(result.newState.isGameActive).toBe(false);
        expect(result.newState.gameStage).toBe('gameOver');
        expect(result.shouldShowdown).toBe(false);
        expect(result.gameEnded).toBe(true);
        expect(result.winner).toBe('opponent');
        expect(result.message).toBe("プレイヤーがフォールドしました。相手の勝利です。");
      });

      it('should apply opponent fold correctly', () => {
        const stateWithOpponentTurn = { ...initialGameState, currentPlayer: 'opponent' as const };
        const result = gameManager.applyPlayerAction(stateWithOpponentTurn, 'fold', false);
        
        expect(result.newState.opponentAction).toBe('fold');
        expect(result.newState.wins).toBe(1);
        expect(result.newState.playerChips).toBe(3); // 1 + 2 (pot)
        expect(result.newState.isGameActive).toBe(false);
        expect(result.gameEnded).toBe(true);
        expect(result.winner).toBe('player');
        expect(result.message).toBe("相手がフォールドしました。プレイヤーの勝利です！");
      });
    });

    describe('error handling', () => {
      it('should throw error when game is not active', () => {
        const inactiveState = { ...initialGameState, isGameActive: false };
        
        expect(() => {
          gameManager.applyPlayerAction(inactiveState, 'bet', true);
        }).toThrow('Game is not active');
      });

      it('should throw error when not player turn', () => {
        expect(() => {
          gameManager.applyPlayerAction(initialGameState, 'bet', false); // Player 2 trying to act when it's Player 1's turn
        }).toThrow('Not your turn');
      });

      it('should throw error for invalid action', () => {
        expect(() => {
          gameManager.applyPlayerAction(initialGameState, 'invalid' as GameAction, true);
        }).toThrow('Invalid action: invalid');
      });
    });
  });

  describe('executeShowdown', () => {
    it('should execute showdown with player winning', () => {
      const showdownState = {
        ...initialGameState,
        gameStage: 'showdown' as const,
        pot: 4,
        playerCard: 'A',
        opponentCard: 'K'
      };
      
      const result = gameManager.executeShowdown(showdownState);
      
      expect(result.newState.showOpponentCard).toBe(true);
      expect(result.newState.isGameActive).toBe(false);
      expect(result.newState.gameStage).toBe('gameOver');
      expect(result.newState.playerChips).toBe(5); // 1 + 4 (pot)
      expect(result.newState.wins).toBe(1);
      expect(result.newState.pot).toBe(0);
      expect(result.gameEnded).toBe(true);
      expect(result.winner).toBe('player');
      expect(result.message).toBe('プレイヤーの勝利！ A vs K');
    });

    it('should execute showdown with opponent winning', () => {
      const showdownState = {
        ...initialGameState,
        gameStage: 'showdown' as const,
        pot: 4,
        playerCard: 'Q',
        opponentCard: 'A'
      };
      
      const result = gameManager.executeShowdown(showdownState);
      
      expect(result.newState.opponentChips).toBe(5); // 1 + 4 (pot)
      expect(result.newState.losses).toBe(1);
      expect(result.winner).toBe('opponent');
      expect(result.message).toBe('相手の勝利... Q vs A');
    });

    it('should throw error when not in showdown phase', () => {
      expect(() => {
        gameManager.executeShowdown(initialGameState);
      }).toThrow('Game is not in showdown phase');
    });
  });

  describe('validateGameState', () => {
    it('should validate correct game state', () => {
      const isValid = gameManager.validateGameState(initialGameState);
      expect(isValid).toBe(true);
    });

    it('should invalidate state with negative pot', () => {
      const invalidState = { ...initialGameState, pot: -1 };
      const isValid = gameManager.validateGameState(invalidState);
      expect(isValid).toBe(false);
    });

    it('should invalidate state with negative chips', () => {
      const invalidState = { ...initialGameState, playerChips: -1 };
      const isValid = gameManager.validateGameState(invalidState);
      expect(isValid).toBe(false);
    });

    it('should invalidate state with invalid cards', () => {
      const invalidState = { ...initialGameState, playerCard: 'J' };
      const isValid = gameManager.validateGameState(invalidState);
      expect(isValid).toBe(false);
    });

    it('should invalidate state with same cards', () => {
      const invalidState = { ...initialGameState, opponentCard: 'A' }; // Same as playerCard
      const isValid = gameManager.validateGameState(invalidState);
      expect(isValid).toBe(false);
    });
  });

  describe('simulateGameScenario', () => {
    it('should simulate complete game: bet -> call -> showdown', () => {
      const actions = [
        { player: 'bet' as GameAction, isPlayer1: true },
        { player: 'call' as GameAction, isPlayer1: false }
      ];
      
      const results = gameManager.simulateGameScenario(initialGameState, actions);
      
      // 修正: 正しい期待値に変更
      expect(results).toHaveLength(3); // bet, call, showdown
      expect(results[0].message).toBe("ベットしました。相手の番です。");
      expect(results[1].message).toBe("コールしました。ショーダウンです！");
      expect(results[2].message).toBe("プレイヤーの勝利！ A vs K");
      expect(results[2].gameEnded).toBe(true);
    });

    it('should simulate game: check -> check -> showdown', () => {
      const actions = [
        { player: 'check' as GameAction, isPlayer1: true },
        { player: 'check' as GameAction, isPlayer1: false }
      ];
      
      const results = gameManager.simulateGameScenario(initialGameState, actions);
      
      expect(results).toHaveLength(3); // check, check, showdown
      expect(results[1].shouldShowdown).toBe(true);
      expect(results[2].gameEnded).toBe(true);
    });

    it('should simulate game ending with fold', () => {
      const actions = [
        { player: 'bet' as GameAction, isPlayer1: true },
        { player: 'fold' as GameAction, isPlayer1: false }
      ];
      
      const results = gameManager.simulateGameScenario(initialGameState, actions);
      
      expect(results).toHaveLength(2); // bet, fold
      expect(results[1].gameEnded).toBe(true);
      expect(results[1].winner).toBe('player');
    });

    it('should handle errors in simulation', () => {
      const actions = [
        { player: 'bet' as GameAction, isPlayer1: false } // Wrong player turn
      ];
      
      const results = gameManager.simulateGameScenario(initialGameState, actions);
      
      expect(results).toHaveLength(1);
      expect(results[0].message).toContain('Error: Not your turn');
      expect(results[0].gameEnded).toBe(true);
    });
  });
});