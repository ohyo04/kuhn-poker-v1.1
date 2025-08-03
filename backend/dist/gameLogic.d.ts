export interface GameState {
    playerCard: string;
    opponentCard: string;
    pot: number;
    playerChips: number;
    opponentChips: number;
    betAmount: number;
    wins: number;
    losses: number;
    ev: number;
    gamePhase: string;
    currentPlayer: 'player' | 'opponent';
    gameStage: 'betting' | 'showdown' | 'gameOver';
    playerAction: string | null;
    opponentAction: string | null;
    isGameActive: boolean;
    showOpponentCard: boolean;
    waitingForOpponent: boolean;
    gameMode?: 'ai' | 'online';
    player1Id?: string;
    player2Id?: string;
}
export declare const determineWinner: (playerCard: string, opponentCard: string) => "player" | "opponent";
export declare const getOpponentAction: (playerAction: string, random?: number) => string;
export declare const isValidCard: (card: string) => boolean;
export declare const calculateInitialChips: () => number;
export declare const calculateChipsAfterBet: (currentChips: number, betAmount: number) => number;
export declare const addToPot: (currentPot: number, betAmount: number) => number;
//# sourceMappingURL=gameLogic.d.ts.map