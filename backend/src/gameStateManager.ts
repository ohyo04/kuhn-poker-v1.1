import { GameState, determineWinner } from './gameLogic.js';

export type GameAction = 'bet' | 'check' | 'call' | 'fold';
export type GamePhase = 'betting' | 'showdown' | 'gameOver';

export interface GameTransitionResult {
  newState: GameState;
  shouldShowdown: boolean;
  gameEnded: boolean;
  winner?: 'player' | 'opponent';
  message: string;
}

export class GameStateManager {
  
  // プレイヤーアクションを適用
  applyPlayerAction(gameState: GameState, action: GameAction, isPlayer1: boolean): GameTransitionResult {
    if (!gameState.isGameActive) {
      throw new Error('Game is not active');
    }

    const newState = { ...gameState };
    let shouldShowdown = false;
    let gameEnded = false;
    let winner: 'player' | 'opponent' | undefined;
    let message = '';

    // 現在のプレイヤーターンかチェック
    const currentPlayerIsPlayer1 = newState.currentPlayer === 'player';
    if (currentPlayerIsPlayer1 !== isPlayer1) {
      throw new Error('Not your turn');
    }

    switch (action) {
      case 'bet':
        this.handleBetAction(newState, isPlayer1);
        message = "ベットしました。相手の番です。";
        break;

      case 'check':
        const checkResult = this.handleCheckAction(newState, isPlayer1);
        shouldShowdown = checkResult.shouldShowdown;
        message = checkResult.message;
        break;

      case 'call':
        this.handleCallAction(newState, isPlayer1);
        shouldShowdown = true;
        message = "コールしました。ショーダウンです！";
        break;

      case 'fold':
        const foldResult = this.handleFoldAction(newState, isPlayer1);
        gameEnded = true;
        winner = foldResult.winner;
        message = foldResult.message;
        break;

      default:
        throw new Error(`Invalid action: ${action}`);
    }

    return {
      newState,
      shouldShowdown,
      gameEnded,
      winner,
      message
    };
  }

  // ショーダウンを実行
  executeShowdown(gameState: GameState): GameTransitionResult {
    if (gameState.gameStage !== 'showdown') {
      throw new Error('Game is not in showdown phase');
    }

    const winner = determineWinner(gameState.playerCard, gameState.opponentCard);
    const newState = { ...gameState };

    newState.showOpponentCard = true;
    newState.isGameActive = false;
    newState.gameStage = 'gameOver';

    let message = '';
    if (winner === 'player') {
      newState.playerChips += newState.pot;
      newState.wins += 1;
      message = `プレイヤーの勝利！ ${newState.playerCard} vs ${newState.opponentCard}`;
    } else {
      newState.opponentChips += newState.pot;
      newState.losses += 1;
      message = `相手の勝利... ${newState.playerCard} vs ${newState.opponentCard}`;
    }

    newState.pot = 0;

    return {
      newState,
      shouldShowdown: false,
      gameEnded: true,
      winner,
      message
    };
  }

  // ベットアクションの処理
  private handleBetAction(gameState: GameState, isPlayer1: boolean): void {
    // 修正: ベットするプレイヤーのチップのみチェック
    if (isPlayer1 && gameState.playerChips < gameState.betAmount) {
      throw new Error('Insufficient chips to bet');
    }
    if (!isPlayer1 && gameState.opponentChips < gameState.betAmount) {
      throw new Error('Insufficient chips to bet');
    }

    gameState.pot += gameState.betAmount;

    if (isPlayer1) {
      gameState.playerChips -= gameState.betAmount;
      gameState.playerAction = 'bet';
    } else {
      gameState.opponentChips -= gameState.betAmount;
      gameState.opponentAction = 'bet';
    }

    gameState.currentPlayer = gameState.currentPlayer === 'player' ? 'opponent' : 'player';
    gameState.waitingForOpponent = gameState.currentPlayer === 'opponent';
  }

  // チェックアクションの処理
  private handleCheckAction(gameState: GameState, isPlayer1: boolean): { shouldShowdown: boolean, message: string } {
    if (isPlayer1) {
      gameState.playerAction = 'check';
    } else {
      gameState.opponentAction = 'check';
    }

    // 両方がチェックした場合はショーダウン
    if (gameState.playerAction === 'check' && gameState.opponentAction === 'check') {
      gameState.gameStage = 'showdown';
      gameState.waitingForOpponent = false;
      return { shouldShowdown: true, message: "両者チェック。ショーダウンです！" };
    } else {
      gameState.currentPlayer = gameState.currentPlayer === 'player' ? 'opponent' : 'player';
      gameState.waitingForOpponent = gameState.currentPlayer === 'opponent';
      return { shouldShowdown: false, message: "チェックしました。相手の番です。" };
    }
  }

  // コールアクションの処理
  private handleCallAction(gameState: GameState, isPlayer1: boolean): void {
    // 修正: コールするプレイヤーのチップのみチェック
    if (isPlayer1 && gameState.playerChips < gameState.betAmount) {
      throw new Error('Insufficient chips to call');
    }
    if (!isPlayer1 && gameState.opponentChips < gameState.betAmount) {
      throw new Error('Insufficient chips to call');
    }

    gameState.pot += gameState.betAmount;

    if (isPlayer1) {
      gameState.playerChips -= gameState.betAmount;
      gameState.playerAction = 'call';
    } else {
      gameState.opponentChips -= gameState.betAmount;
      gameState.opponentAction = 'call';
    }

    gameState.gameStage = 'showdown';
    gameState.waitingForOpponent = false;
  }

  // フォールドアクションの処理
  private handleFoldAction(gameState: GameState, isPlayer1: boolean): { winner: 'player' | 'opponent', message: string } {
    gameState.isGameActive = false;
    gameState.waitingForOpponent = false;
    gameState.gameStage = 'gameOver';

    if (isPlayer1) {
      gameState.playerAction = 'fold';
      gameState.losses += 1;
      gameState.opponentChips += gameState.pot;
      return { winner: 'opponent', message: "プレイヤーがフォールドしました。相手の勝利です。" };
    } else {
      gameState.opponentAction = 'fold';
      gameState.wins += 1;
      gameState.playerChips += gameState.pot;
      return { winner: 'player', message: "相手がフォールドしました。プレイヤーの勝利です！" };
    }
  }

  // ゲーム状態の整合性チェック
  validateGameState(gameState: GameState): boolean {
    // 基本的な整合性チェック
    if (gameState.pot < 0) return false;
    if (gameState.playerChips < 0) return false;
    if (gameState.opponentChips < 0) return false;
    if (gameState.betAmount <= 0) return false;

    // カードの有効性チェック
    const validCards = ['A', 'K', 'Q'];
    if (!validCards.includes(gameState.playerCard)) return false;
    if (!validCards.includes(gameState.opponentCard)) return false;
    if (gameState.playerCard === gameState.opponentCard) return false;

    // ゲームステージの整合性
    if (gameState.gameStage === 'showdown' && gameState.isGameActive) return false;
    if (gameState.gameStage === 'gameOver' && gameState.isGameActive) return false;

    return true;
  }

  // 完全なゲームシナリオをシミュレート
  simulateGameScenario(
    initialState: GameState, 
    actions: { player: GameAction, isPlayer1: boolean }[]
  ): GameTransitionResult[] {
    let currentState = { ...initialState };
    const results: GameTransitionResult[] = [];

    for (const actionData of actions) {
      try {
        const result = this.applyPlayerAction(currentState, actionData.player, actionData.isPlayer1);
        results.push(result);
        currentState = result.newState;

        // ショーダウンが必要な場合は自動実行
        if (result.shouldShowdown && !result.gameEnded) {
          const showdownResult = this.executeShowdown(currentState);
          results.push(showdownResult);
          currentState = showdownResult.newState;
          break; // ゲーム終了
        }

        // ゲームが終了した場合は停止
        if (result.gameEnded) {
          break;
        }
      } catch (error) {
        // エラーが発生した場合は記録して停止
        results.push({
          newState: currentState,
          shouldShowdown: false,
          gameEnded: true,
          message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
        break;
      }
    }

    return results;
  }
}