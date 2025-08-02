// ゲームロジックを分離して、テストしやすくします

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

// ゲームの勝敗を判定する関数
export const determineWinner = (playerCard: string, opponentCard: string): 'player' | 'opponent' => {
  const cardValues: { [key: string]: number } = { 'A': 3, 'K': 2, 'Q': 1 };
  const playerValue = cardValues[playerCard];
  const opponentValue = cardValues[opponentCard];
  
  if (playerValue === undefined || opponentValue === undefined) {
    throw new Error('Invalid card value');
  }
  
  return playerValue > opponentValue ? 'player' : 'opponent';
};

// 相手のAI行動を決定する関数（テスト用に乱数を外部から注入できるバージョン）
export const getOpponentAction = (playerAction: string, random: number = Math.random()): string => {
  if (playerAction === 'bet') {
    return random > 0.5 ? 'call' : 'fold';
  } else if (playerAction === 'check') {
    return random > 0.7 ? 'bet' : 'check';
  }
  return 'check';
};

// カードが有効かどうかを判定する関数
export const isValidCard = (card: string): boolean => {
  return ['A', 'K', 'Q'].includes(card);
};

// 初期チップ数を計算する関数
export const calculateInitialChips = (): number => {
  return 1; // 初期チップ数
};

// ベット後のチップ数を計算する関数
export const calculateChipsAfterBet = (currentChips: number, betAmount: number): number => {
  if (currentChips < betAmount) {
    throw new Error('Insufficient chips');
  }
  return currentChips - betAmount;
};

// ポットにチップを追加する関数
export const addToPot = (currentPot: number, betAmount: number): number => {
  if (betAmount < 0) {
    throw new Error('Bet amount cannot be negative');
  }
  return currentPot + betAmount;
};