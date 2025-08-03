import type { GameState } from './gameLogic';
export interface GameTransitionResult {
    newState: GameState;
    shouldShowdown: boolean;
    gameEnded: boolean;
    winner?: "player" | "opponent" | undefined;
}
export declare class GameStateManager {
    static processPlayerAction(gameState: GameState, action: 'bet' | 'call' | 'fold'): GameTransitionResult;
    static processOpponentAction(gameState: GameState, action: 'bet' | 'call' | 'fold'): GameTransitionResult;
    static determineWinner(playerCard: string, opponentCard: string): "player" | "opponent";
}
//# sourceMappingURL=gameStateManager.d.ts.map