import type { GameState } from './gameLogic';

export interface GameTransitionResult {
  newState: GameState;
  shouldShowdown: boolean;
  gameEnded: boolean;
  winner?: "player" | "opponent" | undefined; // undefinedを明示的に許可
}

export class GameStateManager {
  static processPlayerAction(gameState: GameState, action: 'bet' | 'call' | 'fold'): GameTransitionResult {
    const newState = { ...gameState };
    newState.playerAction = action;
    newState.currentPlayer = 'opponent';
    newState.waitingForOpponent = true;

    if (action === 'bet') {
      newState.playerChips -= newState.betAmount;
      newState.pot += newState.betAmount;
      newState.gamePhase = "ベットしました。相手の番です。";
    } else if (action === 'call') {
      newState.playerChips -= 1;
      newState.pot += 1;
      newState.gamePhase = "コールしました。相手の番です。";
    } else if (action === 'fold') {
      newState.gamePhase = "フォールドしました。相手の勝利です。";
      newState.opponentChips += newState.pot;
      newState.pot = 0;
      newState.isGameActive = false;
      newState.waitingForOpponent = false;
      return {
        newState,
        shouldShowdown: false,
        gameEnded: true,
        winner: "opponent"
      };
    }

    return {
      newState,
      shouldShowdown: false,
      gameEnded: false,
      winner: undefined
    };
  }

  static processOpponentAction(gameState: GameState, action: 'bet' | 'call' | 'fold'): GameTransitionResult {
    const newState = { ...gameState };
    newState.opponentAction = action;
    newState.currentPlayer = 'player';
    newState.waitingForOpponent = false;

    if (action === 'fold') {
      newState.gamePhase = "相手がフォールドしました。あなたの勝利です！";
      newState.playerChips += newState.pot;
      newState.pot = 0;
      newState.isGameActive = false;
      return {
        newState,
        shouldShowdown: false,
        gameEnded: true,
        winner: "player"
      };
    }

    if (action === 'call' || (action === 'bet' && newState.playerAction === 'bet')) {
      // ショーダウンへ
      newState.gameStage = 'showdown';
      const winner = GameStateManager.determineWinner(gameState.playerCard, gameState.opponentCard);
      
      return {
        newState,
        shouldShowdown: true,
        gameEnded: true,
        winner
      };
    }

    return {
      newState,
      shouldShowdown: false,
      gameEnded: false,
      winner: undefined
    };
  }

  // determineWinner関数を追加
  static determineWinner(playerCard: string, opponentCard: string): "player" | "opponent" {
    const cardValues: { [key: string]: number } = { 'A': 3, 'K': 2, 'Q': 1 };
    const playerValue = cardValues[playerCard] || 0;
    const opponentValue = cardValues[opponentCard] || 0;
    
    return playerValue > opponentValue ? "player" : "opponent";
  }
}